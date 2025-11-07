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

export const isSpadActive = (item: any) => {
  return item.is_floating && item.is_focused;
};
