import { niriEventStream } from "./utils/niri-socket";

export function NiriState() {
  let workspaces = new Map<number, any>();
  let windows = new Map<number, any>();
  let currentWindowId = undefined;
  let overviewOpen = false;

  const setCurWindowId = (curId: number) => {
    currentWindowId = curId;
    for (const [_, item] of windows) {
      item.is_focused = item.id === curId;
    }
  };
  const stop = niriEventStream((obj) => {
    console.log(`test:>`, JSON.stringify(obj));
    const action = Object.keys(obj)[0];
    switch (action) {
      case "WorkspacesChanged":
        for (const item of obj.WorkspacesChanged.workspaces || []) {
          workspaces.set(item.id, item);
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

  return {
    workspaces,
    windows,
    currentWindowId,
    overviewOpen,
    filterWindow,
    stop,
  };
}
