import { excuse } from "../../utils/exec";
import { niriSendAction } from "../../utils/niri-client";
import { powerActions } from "./powerActions";
import { screenshot, selectWindow } from "./screenshot";
import { switchScreen } from "./switch-screen";

export async function actions(req: Request) {
  const data = await req.json(); // 解析 JSON body
  const { action } = data as Record<string, any>;

  switch (action) {
    case "power-actions":
      await powerActions();
      break;
    case "next-column-center":
      await niriSendAction({ FocusColumnRightOrFirst: {} });
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
      console.log(`test:>screenshot`);
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
    case "swith-screen":
      switchScreen();
      break;
  }
}
