import { niriEventStream } from "../utils/niri-client";

export type NiriStateType = ReturnType<typeof NiriState>;
export function NiriState() {
  let outputs = new Set<string>();
  let workspaces = new Map<number, any>();
  let windows = new Map<number, any>();
  let currentWindowId: number | undefined = undefined;
  let currentWorkspaceId: number | undefined = undefined;
  let overviewOpen = false;
  const listeners = new Set<(name: string, data: any) => void>();

  const setCurWindowId = (curId: number) => {
    currentWindowId = curId;
    const curWindow = windows.get(curId);
    if (curId) {
      const workspace_id = curWindow.workspace_id;
      for (const [_, item] of windows) {
        item.is_focused = item.id === curId;
      }
      if (workspace_id) {
        setActiveWorkspace(workspace_id, curId, true);
      }
    }
    for (const item of listeners) {
      item("FocusWindow", curWindow);
    }
  };

  const getActiveWorkspaceId = () => {
    return currentWorkspaceId;
  };

  const setActiveWorkspace = (
    curId: number,
    active_window_id?: number,
    focus = false
  ) => {
    const output = workspaces.get(curId)?.output;
    if (!output) {
      return;
    }
    for (const [_, item] of workspaces) {
      if (item.output !== output) {
        continue;
      }
      item.is_active = item.id === curId;
      if (active_window_id) {
        item.active_window_id = active_window_id;
      }
    }
    if (focus) {
      currentWorkspaceId = curId;
      for (const [_, item] of workspaces) {
        item.is_focused = item.id === curId;
      }
    }
  };

  const getWindowOutput = (windowId: number) => {
    const workspace_id = windows.get(windowId)?.workspace_id;
    if (!workspace_id) {
      return;
    }
    return workspaces.get(workspace_id).output as number | undefined;
  };

  const stop = niriEventStream((obj) => {
    const action = Object.keys(obj)[0];
    for (const item of listeners) {
      item(action!, obj);
    }
    // console.log(`test:>`, JSON.stringify(obj));
    switch (action) {
      case "WorkspacesChanged":
        workspaces.clear();
        outputs.clear();
        for (const item of obj.WorkspacesChanged.workspaces || []) {
          if (item.is_active) {
            // 先等所有的workspace记录之后再去设置当前id
            setTimeout(() => {
              setActiveWorkspace(item.id);
            });
          }
          workspaces.set(item.id, item);
          if (!outputs.has(item.output)) {
            outputs.add(item.output);
          }
        }
        break;
      case "WorkspaceActivated":
        setActiveWorkspace(
          obj.WorkspaceActivated.id,
          obj.WorkspaceActivated.focused
        );
        break;
      case "WindowsChanged":
        for (const item of obj.WindowsChanged.windows || []) {
          windows.set(item.id, item);
          if (item.is_focused) {
            setTimeout(() => {
              setCurWindowId(item.id);
            });
          }
        }
        break;
      case "WindowClosed":
        windows.delete(obj.WindowClosed.id);
        break;
      case "OverviewOpenedOrClosed":
        overviewOpen = obj.OverviewOpenedOrClosed;
        break;
      case "WindowOpenedOrChanged":
        const openItem = obj.WindowOpenedOrChanged.window;
        windows.set(openItem.id, openItem);
        if (openItem.is_focused) {
          setCurWindowId(openItem.id);
        }
        break;
      case "WindowFocusChanged":
        setCurWindowId(obj.WindowFocusChanged.id || undefined);
        break;
    }
  });

  const filterWindow = (filterFn: (item: any) => boolean) => {
    const results = [] as any[];
    for (const [key, item] of windows) {
      if (filterFn(item)) {
        results.push(item);
      }
    }
    return results;
  };

  const getOutputOtherWorkspace = (workspace_id: number) => {
    const output = workspaces.get(workspace_id).output;
    const hasWindowWorkspace = [] as any[];
    const noWindowWorkspace = [] as any[];
    for (const [key, item] of workspaces) {
      if (item.output !== output || item.id === workspace_id) {
        continue;
      }
      let hasWin = false;
      for (const [, win] of windows) {
        if (win.workspace_id === item.id) {
          hasWin = true;
          break;
        }
      }
      if (hasWin) {
        hasWindowWorkspace.push(item);
      } else {
        noWindowWorkspace.push(item);
      }
    }
    if (hasWindowWorkspace.length) {
      return hasWindowWorkspace[0];
    }
    return noWindowWorkspace[0];
  };

  const getState = () => {
    return {
      outputs: [...outputs],
      windows: Object.fromEntries(windows),
      workspaces: Object.fromEntries(workspaces),
    };
  };

  const onEvent = (event: string, fn: (params: any) => void, once = false) => {
    const localFn = (name: string, obj: any) => {
      if (name === event) {
        fn(obj);
        if (once) {
          listeners.delete(fn);
        }
      }
    };
    listeners.add(localFn);

    return () => {
      listeners.delete(localFn);
    };
  };

  return {
    outputs,
    workspaces,
    windows,
    getState,
    getWindowOutput,
    overviewOpen,
    filterWindow,
    onEvent,
    getOutputOtherWorkspace,
    getActiveWorkspaceId,
    get currentWorkspaceId() {
      return currentWorkspaceId;
    },
    get currentWindowId() {
      return currentWorkspaceId;
    },
    // onBlur,
    stop,
  };
}
