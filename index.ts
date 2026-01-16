import Bun from "bun";
import { actions } from "./src/command/actions/actions";
import { getCurWindow } from "./src/command/actions/get-cur-window";
import { runApp } from "./src/command/runApp";
import { Spad } from "./src/command/spad";
import { NiriState } from "./src/state/state";
import { excuse } from "./src/utils/exec";
import { sleep } from "./src/utils/utils";

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
    // await excuse("pkill waybar 2>/dev/null && waybar &");
    await excuse("killall -q waybar ; sleep 0.3 ; waybar &");
  } catch (err) {
    console.error("excuse 执行失败:", err);
  }
}
await main();

function bunServe() {
  Bun.serve({
    port: 6322,
    fetch: async (req: Request) => {
      const url = new URL(req.url);
      switch (url.pathname) {
        case "/spad":
          await spad(req);
          break;
        case "/action":
          const res = await actions(req);
          if (res !== undefined) {
            return new Response(res, {
              status: 200,
            });
          }
          break;
        case "/runApp":
          await runApp(req);
          break;
        default:
          break;
      }

      return new Response(JSON.stringify(state.getState()), {
        status: 200,
      });
      //  return new Response("404 Not Found", { status: 404 });
    },
  });
}
