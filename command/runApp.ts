import { state } from "..";
import { useWaitWindowOpen } from "../state/useStateHook";
import { excuse } from "../utils/exec";
import { niriSendActionArrSequence } from "../utils/niri-client";

export async function runApp(req: Request) {
  const waitWindowOpen = useWaitWindowOpen(state);
  try {
    const data = await req.json(); // 解析 JSON body
    // console.log(`test:>runApp`);
    const { title, app_id, cmd } = data as Record<string, any>;
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
      await excuse(cmd, { nohup: true });
      item = await waitWindowOpen(filterFn);
    } else {
      const index = apps.findIndex((item) => item.is_focused) || -1;
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
