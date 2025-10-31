import Bun from "bun";
import { powerActions } from "./command/powerActions";
import { NiriState } from "./state";
import { excuse } from "./utils/exec";
import { niriSend } from "./utils/niri-socket";
import { sleep } from "./utils/utils";

const { stop, filterWindow, ...state } = NiriState();
async function main() {
  Bun.serve({
    port: 6321,
    fetch: async (req: Response) => {
      const url = new URL(req.url);

      if (url.pathname === "/powerOptions") {
        await powerActions();
        return new Response("OK", { status: 200 });
      } else if (url.pathname === "/getState") {
        await sleep(1);
        return Response.json("OK", { status: 200 });
      } else if (url.pathname === "/runApp") {
        const data = await req.json(); // 解析 JSON body
        const { title, app_id, cmd } = data;
        const apps = filterWindow((item) => {
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
        } else {
          for (const item of apps) {
            if (!item.is_focused) {
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
              break;
            }
          }
        }

        return Response.json("OK", { status: 200 });
      }

      return new Response("404 Not Found", { status: 404 });
    },
  });
}
await main();
