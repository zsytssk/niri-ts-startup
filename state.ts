import { niriEventStream } from "./utils/niri-socket";

export function NiriState() {
  let workspaces = new Map<number, any>();
  let windows = new Map<number, any>();
  let currentWindowId: number | undefined = undefined;
  let currentWorkspaceId: number | undefined = undefined;
  let overviewOpen = false;
  const listeners = new Set<(name: string, data: any) => void>();

  const setCurWindowId = (curId: number) => {
    currentWindowId = curId;
    const workspace_id = windows.get(curId).workspace_id;
    for (const [_, item] of windows) {
      item.is_focused = item.id === curId;
    }
    if (workspace_id) {
      setActiveWorkspace(workspace_id, true);
    }
  };

  const getActiveWorkspaceId = () => {
    return currentWorkspaceId;
  };

  const setActiveWorkspace = (curId: number, focus = false) => {
    const output = workspaces.get(curId).output;
    if (!output) {
      return;
    }
    for (const [_, item] of workspaces) {
      if (item.output !== output) {
        continue;
      }
      item.is_active = item.id === curId;
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
    console.log(`test:>`, JSON.stringify(obj));
    const action = Object.keys(obj)[0];
    for (const item of listeners) {
      item(action, obj);
    }
    switch (action) {
      case "WorkspacesChanged":
        workspaces.clear();
        for (const item of obj.WorkspacesChanged.workspaces || []) {
          if (item.is_active) {
            // 先等所有的workspace记录之后再去设置当前id
            setTimeout(() => {
              setActiveWorkspace(item.id);
            });
          }
          workspaces.set(item.id, item);
        }
        break;
      case "WorkspaceActivated":
        setActiveWorkspace(
          obj.WorkspaceActivated.id,
          obj.WorkspaceActivated.focused,
        );
        break;
      case "WindowsChanged":
        for (const item of obj.WindowsChanged.windows || []) {
          windows.set(item.id, item);
          if (item.is_focused) {
            setCurWindowId(item.id);
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
        setCurWindowId(obj.WindowFocusChanged.id);
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
    for (const [key, item] of workspaces) {
      if (item.output !== output) {
        continue;
      }
      if (item.id !== workspace_id) {
        return item;
      }
    }
  };

  const isWindowWorkspaceFocus = (item: any) => {
    const workspace = workspaces.get(item.workspace_id);
    return workspace.is_focused;
  };

  const waitWindowOpen = async (filterFn: (item: any) => boolean) => {
    for (const [key, item] of windows) {
      if (filterFn(item)) {
        return item;
      }
    }
    return new Promise((resolve) => {
      const fn = (name: string, obj: any) => {
        if (name === "WindowOpenedOrChanged") {
          const window = obj.WindowOpenedOrChanged.window;
          if (filterFn(window)) {
            resolve(window);
            listeners.delete(fn);
          }
        }
      };
      listeners.add(fn);
    });
  };

  return {
    workspaces,
    windows,
    currentWindowId: currentWindowId,
    getWindowOutput,
    overviewOpen,
    filterWindow,
    waitWindowOpen,
    getOutputOtherWorkspace,
    getActiveWorkspaceId,
    isWindowWorkspaceFocus,
    // onBlur,
    stop,
  };
}
