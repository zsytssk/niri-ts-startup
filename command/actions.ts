import { excuse } from "../utils/exec";
import { niriSend } from "../utils/niri-socket";

export async function actions(req: Response) {
  const data = await req.json(); // 解析 JSON body
  const { action } = data;

  switch (action) {
    case "next-column-center":
      await niriSend({
        Action: {
          FocusColumnRightOrFirst: {},
        },
      });
      await niriSend({
        Action: {
          CenterColumn: {},
        },
      });
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
      break;
  }
}
