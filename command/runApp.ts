import { niriFilterWindow } from "..";
import { excuse } from "../utils/exec";
import { niriSend } from "../utils/niri-socket";

export async function runApp(req: Response) {
  try {
    const data = await req.json(); // 解析 JSON body
    // console.log(`test:>runApp`);
    const { title, app_id, cmd } = data;
    const apps = niriFilterWindow((item) => {
      if (title) {
        return item.title === title;
      }
      if (app_id) {
        return item.app_id === app_id;
      }
      return false;
    });
    if (!apps.length) {
      excuse(cmd, {});
      return;
    }
    const index = apps.findIndex((item) => item.is_focused);
    // console.log(`test:>runApp`, index, apps.length);
    let nextIndex = index + 1;
    if (nextIndex >= apps.length) {
      nextIndex = 0;
    }
    const item = apps[nextIndex];
    await niriSend({
      Action: {
        FocusWindow: { id: item.id },
      },
    });
    await niriSend({
      Action: {
        CenterWindow: { id: item.id },
      },
    });
  } catch (err) {
    console.log(`test:>`, 123213, err);
  }
}
