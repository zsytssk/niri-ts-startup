import Bun from "bun";
import { powerActions } from "./command/powerActions";
import { runApp } from "./command/runApp";
import { spad } from "./command/spad";
import { NiriState } from "./state";
import { actions } from "./command/actions/actions";

export const state = NiriState();

async function main() {
  Bun.serve({
    port: 6321,
    fetch: async (req: Response) => {
      const url = new URL(req.url);
      switch (url.pathname) {
        case "/powerOptions":
          await powerActions();
          break;
        case "/spad":
          await spad(req);
          break;
        case "/actions":
          await actions(req);
          break;
        case "/runApp":
          await runApp(req);
          break;
        default:
          console.log(`state:>`, state);
          break;
      }

      return Response.json("OK", { status: 200 });
      //  return new Response("404 Not Found", { status: 404 });
    },
  });
}
await main();
