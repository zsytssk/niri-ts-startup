import Bun from "bun";
import { runApp } from "./command/runApp";
import { spad } from "./command/spad";
import { NiriState } from "./state/state";
import { actions } from "./command/actions/actions";
import { getCurWindow } from "./command/getCurWindow";

export const state = NiriState();

async function main() {
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
await main();
