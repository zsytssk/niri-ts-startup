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
    for (const [_, item] of windows) {
      item.is_focused = item.id === curId;
    }
  };
  const stop = niriEventStream((obj) => {
    // console.log(`test:>`, JSON.stringify(obj));
    const action = Object.keys(obj)[0];
    for (const item of listeners) {
      item(action, obj);
    }
    switch (action) {
      case "WorkspacesChanged":
        workspaces.clear();
        for (const item of obj.WorkspacesChanged.workspaces || []) {
          if (item.is_active) {
            currentWorkspaceId = item.id;
          }
          workspaces.set(item.id, item);
        }
        break;
      case "WorkspaceActivated":
        currentWorkspaceId = obj.WorkspaceActivated.id;
        for (const [, item] of workspaces || []) {
          item.is_active = item.id === currentWorkspaceId;
        }
        break;
      case "WindowsChanged":
        for (const item of obj.WindowsChanged.windows || []) {
          windows.set(item.id, item);
          if (item.is_focused) {
            currentWindowId = item.id;
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
    const results = [];
    for (const [key, item] of windows) {
      if (filterFn(item)) {
        results.push(item);
      }
    }
    return results;
  };

  const getNotActiveWorkspace = () => {
    for (const [key, item] of workspaces) {
      if (item.id !== currentWorkspaceId) {
        return item;
      }
    }
  };

  const isWindowInView = (item: any) => {
    return item.workspace_id === currentWorkspaceId;
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

  // const onBlur = async (item: any, fn: (item: any) => void) => {
  //   await new Promise((resolve) => {
  //     const fn = (name: string, obj: any) => {
  //       if (name === "WindowFocusChanged") {
  //         const windowId = obj.WindowFocusChanged.id;
  //         if (filterFn(window)) {
  //           resolve(window);
  //           listeners.delete(fn);
  //         }
  //       }
  //     };
  //     listeners.add(fn);
  //   });
  // };

  return {
    workspaces,
    windows,
    currentWindowId,
    overviewOpen,
    filterWindow,
    waitWindowOpen,
    getNotActiveWorkspace,
    getActiveWorkspaceId: () => currentWorkspaceId,
    isWindowInView,
    // onBlur,
    stop,
  };
}
