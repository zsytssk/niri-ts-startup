import Bun from "bun";
import { runApp } from "./command/runApp";
import { Spad } from "./command/spad";
import { NiriState } from "./state/state";
import { actions } from "./command/actions/actions";
import { getCurWindow } from "./command/getCurWindow";
import { excuse } from "./utils/exec";
import { sleep } from "./utils/utils";

export const state = NiriState();
export const spad = Spad(state);

async function main() {
  console.log(`test:>`, new Date().toString());
  for (let i = 0; i < 3; i++) {
    try {
      bunServe();
      break;
    } catch (err) {
      console.log(err);
      await sleep(1);
    }
  }
  try {
    await excuse("notify-send 启动 niri-ts-startup!");
    await excuse("pkill waybar 2>/dev/null && waybar &");
  } catch (err) {
    console.error("excuse 执行失败:", err);
  }
}
await main();

function bunServe() {
  Bun.serve({
    port: 6321,
    fetch: async (req: Request) => {
      const url = new URL(req.url);
      switch (url.pathname) {
        case "/spad":
          await spad(req);
          break;
        case "/actions":
          await actions(req);
          break;
        case "/runApp":
          await runApp(req);
          break;
        case "/getCurWindow":
          const title = await getCurWindow(req);
          return new Response(title, {
            status: 200,
          });
        default:
          return new Response(JSON.stringify(state.getState()), {
            status: 200,
          });
      }

      return new Response("OK", { status: 200 });
      //  return new Response("404 Not Found", { status: 404 });
    },
  });
}
