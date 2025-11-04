import {
  niriFilterWindow,
  niriGetActiveWorkspaceId,
  niriGetOutputOtherWorkspace,
  niriIsWindowWorkspaceFocus,
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

  jobNote: {
    cmd: `ghostty --title="JobNote" --class="jobNote.ghostty" --x11-instance-name=jobNote --working-directory=/home/zsy/Documents/zsy/github/jobNote -e nvim`,
    match: (item: any) => item.app_id == "jobNote.ghostty",
    height: 600,
    width: 1200,
  },

  youdao: {
    cmd: `google-chrome-stable --app-id="dbgilkgiemncodkddegnikoceledjgho"`,
    match: (item: any) =>
      item.app_id == "chrome-dbgilkgiemncodkddegnikoceledjgho-Default",
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

  deepseek: {
    cmd: `google-chrome-stable --app-id="hmjcdonmhijmnefklekckjkeoknbiipb"`,
    match: (item: any) =>
      item.app_id == "chrome-hmjcdonmhijmnefklekckjkeoknbiipb-Default",
    height: 600,
    width: 1200,
  },

  chatgpt: {
    cmd: `google-chrome-stable --app-id="cadlkienfkclaiaibeoongdcgmdikeeg"`,
    match: (item: any) =>
      item.app_id == "chrome-cadlkienfkclaiaibeoongdcgmdikeeg-Default",
    height: 600,
    width: 1200,
  },

  explorer: {
    cmd: `ghostty --title="ExplorerPop" --class="explorerPop.ghostty" --x11-instance-name="explorerPop" -e yazi`,
    match: (item: any) => item.app_id == "explorerPop.ghostty",
    height: 600,
    width: 1200,
  },

  tip: {
    cmd: `ghostty --title="Tip" --class="tip.ghostty" --x11-instance-name=tip --working-directory=/home/zsy/Documents/zsy/github/jobNote -e nvim ./tip.md`,
    match: (item: any) => item.app_id == "tip.ghostty",
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

  if (niriIsWindowWorkspaceFocus(item)) {
    const otherWorkspace = niriGetOutputOtherWorkspace(item.workspace_id);

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
