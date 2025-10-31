import {
  niriFilterWindow,
  niriGetActiveWorkspaceId,
  niriGetNotActiveWorkspace,
  niriIsWindowInView,
} from "..";
import { excuse } from "../utils/exec";
import { niriSend } from "../utils/niri-socket";

type Spad = {
  cmd: string;
  match: (win: any) => boolean;
  width: number;
  height: number;
};

const SpadMap = {
  term: {
    cmd: `ghostty --title="TermSpad" --class="TermSpad.ghostty"`,
    match: (item: any) => {
      return item.title == "TermSpad";
    },
    height: 600,
    width: 1200,
  },

  doubao: {
    cmd: `google-chrome-stable --app-id="nfjhphkhjelhenadmhihghlkccjdpdkk"`,
    match: (item: any) =>
      item.app_id == "chrome-nfjhphkhjelhenadmhihghlkccjdpdkk-Default",
    height: 600,
    width: 1200,
  },
} as Record<string, Spad>;

export async function spad(req: Response) {
  const data = await req.json(); // 解析 JSON body
  const { name } = data;
  const config = SpadMap[name];
  if (!config) {
    return;
  }

  let item = niriFilterWindow(config.match)?.[0];
  // console.log(`test:>spad`, item);
  if (!item) {
    excuse(config.cmd, {});
    return;
  }

  if (niriIsWindowInView(item)) {
    const otherWorkspace = niriGetNotActiveWorkspace();

    await niriSend({
      Action: {
        MoveWindowToWorkspace: {
          window_id: item.id,
          focus: false,
          reference: { Id: otherWorkspace.id },
        },
      },
    });
    await niriSend({
      Action: {
        ToggleWindowFloating: { id: item.id },
      },
    });
    return;
  }

  await niriSend({
    Action: {
      MoveWindowToWorkspace: {
        window_id: item.id,
        focus: false,
        reference: { Id: niriGetActiveWorkspaceId() },
      },
    },
  });
  await niriSend({
    Action: {
      MoveWindowToFloating: { id: item.id },
    },
  });
}
