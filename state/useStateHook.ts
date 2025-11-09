import { sleep } from "../utils/utils";
import type { NiriStateType } from "./state";

export const useWaitWindowOpen = (state: NiriStateType) => {
  return async (filterFn: (item: any) => boolean) => {
    for (const [key, item] of state.windows) {
      if (filterFn(item)) {
        return item;
      }
    }
    return new Promise((resolve) => {
      const off = state.onEvent("WindowOpenedOrChanged", (obj) => {
        const window = obj.WindowOpenedOrChanged.window;
        if (filterFn(window)) {
          resolve(window);
          off();
        }
      });
    });
  };
};

export const useWaitScreenShot = (state: NiriStateType) => {
  return () => {
    const task1 = new Promise((resolve) => {
      const off = state.onEvent(
        "ScreenshotCaptured",
        (obj) => {
          const path = obj.ScreenshotCaptured.path;
          resolve(path);
          off();
        },
        true
      );
    });

    const task2 = new Promise<void>((resolve) => {
      const off = state.onEvent("WindowFocusChanged", (obj) => {
        if (obj.WindowFocusChanged.id) {
          off();
          sleep(1).then(() => {
            resolve();
          });
        }
      });
    });

    return Promise.race([task1, task2]);
  };
};

export const useOnWindowBlur = (state: NiriStateType) => {
  return (item: any, fn: () => void) => {
    const off = state.onEvent("WindowFocusChanged", (obj) => {
      if (obj?.id !== item.id) {
        fn();
        off();
      }
    });

    return off;
  };
};
export const useOutputOtherWorkspace = (state: NiriStateType) => {
  return (workspace_id: number) => {
    const { workspaces, windows } = state;
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

    /** 不选择最两边的workspace, 防止niri自动创建新的workspace */
    const allNum = noWindowWorkspace.length + 1;
    for (const item of noWindowWorkspace) {
      if (item.idx === 1 && item.idx === allNum) {
        continue;
      }
      return item;
    }
    return noWindowWorkspace[0];
  };
};

export const isSpadActive = (item: any) => {
  return item.is_floating && item.is_focused;
};

export const useWorkspaceWindows = (state: NiriStateType) => {
  const result = [] as any[];
  return (workspaceId: number) => {
    const { windows } = state;

    for (const [, window] of windows) {
      if (window.workspace_id !== workspaceId) {
        continue;
      }
      result.push(window);
    }
    return result.sort((a, b) => {
      if (!b.layout.pos_in_scrolling_layout) {
        return -1;
      }
      if (!a.layout.pos_in_scrolling_layout) {
        return 1;
      }
      const [ax, ay] = a.layout.pos_in_scrolling_layout;
      const [bx, by] = b.layout.pos_in_scrolling_layout;
      return ax - bx || ay - by;
    });
  };
};
