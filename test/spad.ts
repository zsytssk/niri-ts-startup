import { niriFilterWindow, niriWaitWindowOpen } from "..";
import { excuse } from "../utils/exec";
import { niriSend, niriSendGetArr } from "../utils/niri-socket";

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
      console.log(`test:>`, item);
      return item.title == "TermSpad";
    },
    height: 600,
    width: 1200,
  },

  doubao: {
    cmd: `google-chrome --app-id="nfjhphkhjelhenadmhihghlkccjdpdkk"`,
    match: (item: any) =>
      item.app_id == "chrome-nfjhphkhjelhenadmhihghlkccjdpdkk-Default",
    height: 900,
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
  if (item) {
    await niriSend({
      Action: {
        FocusWindow: { id: item.id },
      },
    });
    await niriSend({
      Action: {
        MoveColumnToLast: {},
      },
    });
    await niriSend({
      Action: {
        ToggleWindowFloating: { id: item.id },
      },
    });
    return;
  }
  excuse(config.cmd, {});
  await niriWaitWindowOpen(config.match);
  if (!item) {
    return;
  }
  //   await niriSendGetArr([
  //     {
  //       Action: {
  //         FocusWindow: { id: item.id },
  //       },
  //     },
  //     {
  //       Action: {
  //         MoveWindowToFloating: { id: item.id },
  //       },
  //     },
  //     {
  //       Action: {
  //         SetWindowWidth: { id: item.id, change: { SetFixed: config.width } },
  //       },
  //     },
  //     {
  //       Action: {
  //         SetWindowHeight: { id: item.id, change: { SetFixed: config.height } },
  //       },
  //     },
  //     {
  //       Action: {
  //         CenterColumn: {},
  //       },
  //     },
  //     {
  //       Action: {
  //         CenterWindow: { id: item.id },
  //       },
  //     },
  //   ]);
  //   await niriSend({
  //     Action: {
  //       FocusWindow: { id: item.id },
  //     },
  //   });
  //   await niriSend({
  //     Action: {
  //       CenterColumn: {},
  //     },
  //   });
  //   await niriSend({
  //     Action: {
  //       MoveWindowToFloating: { id: item.id },
  //     },
  //   });
  //   await niriSend({
  //     Action: {
  //       SetWindowWidth: { id: item.id, change: { SetFixed: config.width } },
  //     },
  //   });
  //   await niriSend({
  //     Action: {
  //       SetWindowHeight: { id: item.id, change: { SetFixed: config.height } },
  //     },
  //   });
}
