import { excuse } from "../../utils/exec";
import { niriSendAction } from "../../utils/niri-client";
import { focusNextWindow } from "./next-window";
import { powerActions } from "./powerActions";
import { resetState } from "./reset-state";
import { screenshot, selectWindow } from "./screenshot";
import { switchScreen } from "./switch-screen";

export async function actions(req: Request) {
  const data = await req.json(); // 解析 JSON body
  const { action } = data as Record<string, any>;

  switch (action) {
    case "power-actions":
      await powerActions();
      break;
    case "next-window":
      await focusNextWindow();
      break;
    case "select-window":
      await selectWindow();
      break;
    case "screenshot-screen":
      await niriSendAction({
        ScreenshotScreen: { write_to_disk: true, show_pointer: false },
      });
      await screenshot();
      break;
    case "screenshot":
      await niriSendAction({ Screenshot: { show_pointer: false } });
      await screenshot();
      break;
    case "screenshot-window":
      await niriSendAction({ ScreenshotWindow: { write_to_disk: true } });
      await screenshot();
      break;
    case "toggle-input":
      const cur = await excuse("fcitx5-remote");
      if (cur == "2") {
        await excuse("fcitx5-remote -c");
      } else {
        await excuse("fcitx5-remote -o");
      }
      break;
    case "switch-screen":
      switchScreen();
      break;
    case "pick-color":
      const str = (await excuse("niri msg pick-color")) as string;
      const lines = str.split("\n");
      const color = lines[1]?.split(": ")[1];
      await excuse(`echo "${color}" | wl-copy`);
      break;
    case "reset-state":
      resetState();
      break;
  }
}
