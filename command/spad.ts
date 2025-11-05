import { state } from "..";
import { excuse } from "../utils/exec";
import {
  niriSendActionArr,
  niriSendActionArrSequence,
} from "../utils/niri-client";

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
    cmd: `google-chrome-stable --disable-features=GlobalShortcutsPortal --app-id="dbgilkgiemncodkddegnikoceledjgho"`,
    match: (item: any) =>
      item.app_id == "chrome-dbgilkgiemncodkddegnikoceledjgho-Default",
    height: 600,
    width: 1200,
  },

  doubao: {
    cmd: `google-chrome-stable --disable-features=GlobalShortcutsPortal --app-id="nfjhphkhjelhenadmhihghlkccjdpdkk"`,
    match: (item: any) =>
      item.app_id == "chrome-nfjhphkhjelhenadmhihghlkccjdpdkk-Default",
    height: 600,
    width: 1200,
  },

  deepseek: {
    cmd: `google-chrome-stable --disable-features=GlobalShortcutsPortal --app-id="hmjcdonmhijmnefklekckjkeoknbiipb"`,
    match: (item: any) =>
      item.app_id == "chrome-hmjcdonmhijmnefklekckjkeoknbiipb-Default",
    height: 600,
    width: 1200,
  },

  chatgpt: {
    cmd: `google-chrome-stable --disable-features=GlobalShortcutsPortal --app-id="cadlkienfkclaiaibeoongdcgmdikeeg"`,
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

const bindWindiwFn = {} as Record<string, () => void>;

export async function spad(req: Response) {
  const data = await req.json(); // 解析 JSON body
  const { name } = data;
  const config = SpadMap[name];
  if (!config) {
    return;
  }

  let item = state.filterWindow(config.match)?.[0];
  if (item?.id && bindWindiwFn[item?.id]) {
    bindWindiwFn[item?.id]();
    delete bindWindiwFn[item?.id];
  }

  if (item && state.isWindowWorkspaceFocus(item)) {
    const otherWorkspace = state.getOutputOtherWorkspace(item.workspace_id);
    await niriSendActionArrSequence([
      {
        MoveWindowToWorkspace: {
          window_id: item.id,
          focus: false,
          reference: { Id: otherWorkspace.id },
        },
      },
      {
        ToggleWindowFloating: { id: item.id },
      },
    ]);
    return;
  }

  if (!item) {
    excuse(config.cmd, {});
    item = await state.waitWindowOpen(config.match);
    // return;
  }
  await niriSendActionArrSequence([
    {
      MoveWindowToWorkspace: {
        window_id: item.id,
        focus: false,
        reference: { Id: state.getActiveWorkspaceId() },
      },
    },
    {
      MoveWindowToFloating: { id: item.id },
    },
    {
      FocusWindow: { id: item.id },
    },
    {
      CenterWindow: { id: item.id },
    },
  ]);
  item.workspace_id = state.getActiveWorkspaceId();

  bindWindiwFn[item.id] = state.onWindowBlur(item, async () => {
    const otherWorkspace = state.getOutputOtherWorkspace(item.workspace_id);
    await niriSendActionArr([
      {
        MoveWindowToWorkspace: {
          window_id: item.id,
          focus: false,
          reference: { Id: otherWorkspace.id },
        },
      },
      {
        ToggleWindowFloating: { id: item.id },
      },
    ]);
    return;
  });
}
