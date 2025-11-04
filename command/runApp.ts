import { state } from "..";
import { excuse } from "../utils/exec";
import { niriSendActionArrSequence } from "../utils/niri-socket";

export async function runApp(req: Response) {
  try {
    const data = await req.json(); // 解析 JSON body
    // console.log(`test:>runApp`);
    const { title, app_id, cmd } = data;
    const filterFn = (item: any) => {
      if (title) {
        const titleList = title.split("|");
        return titleList.includes(item.title);
      }
      if (app_id) {
        const idList = app_id.split("|");
        return idList.includes(item.app_id);
      }
      return false;
    };
    const apps = state.filterWindow(filterFn);
    let item: any;
    if (!apps.length) {
      await excuse(cmd, {});
      item = await state.waitWindowOpen(filterFn);
    } else {
      const index = apps.findIndex((item) => item.is_focused) || -1;
      // console.log(`test:>runApp`, index, apps.length);
      let nextIndex = index + 1;
      if (nextIndex >= apps.length) {
        nextIndex = 0;
      }
      item = apps[nextIndex];
    }
    await niriSendActionArrSequence([
      {
        FocusWindow: { id: item.id },
      },
      {
        CenterWindow: { id: item.id },
      },
    ]);
  } catch (err) {
    console.log(`test:>`, 123213, err);
  }
}
