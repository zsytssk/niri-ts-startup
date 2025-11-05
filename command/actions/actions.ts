import { excuse } from "../../utils/exec";
import { niriSendAction, niriSendActionArr } from "../../utils/niri-client";
import { swithScreen } from "./swith-screen";

export async function actions(req: Response) {
  const data = await req.json(); // 解析 JSON body
  const { action } = data;

  switch (action) {
    case "next-column-center":
      await niriSendAction({ FocusColumnRightOrFirst: {} });
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
      swithScreen();
      break;
  }
}
