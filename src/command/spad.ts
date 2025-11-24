import { getConfig } from "../config";
import type { NiriStateType } from "../state/state";
import {
  isSpadActive,
  useOnWindowBlur,
  useWaitWindowOpen,
} from "../state/useStateHook";
import { excuse } from "../utils/exec";
import {
  niriSendActionArr,
  niriSendActionArrSequence,
} from "../utils/niri-client";

export type Spad = {
  cmd: string;
  width: number;
  height: number;
  app_id?: string;
  title?: string;
};

const useMatchFn = (config: Spad) => {
  return (item: any) => {
    if (config.app_id) {
      return item.app_id === config.app_id;
    }
    if (config.title) {
      return item.title === config.title;
    }
    return false;
  };
};
const SpadWorkspaceName = "spad";
const bindWindowFn = {} as Record<string, () => void>;

export function Spad(state: NiriStateType) {
  const waitWindowOpen = useWaitWindowOpen(state);
  const onWindowBlur = useOnWindowBlur(state);
  return async (req: Request) => {
    const projectConfig = await getConfig();
    const data = await req.json(); // 解析 JSON body
    const { name } = data as Record<string, any>;
    const config = projectConfig.SpadMap[name];
    if (!config) {
      return;
    }
    const matchFn = useMatchFn(config);

    let item = state.filterWindow(matchFn)?.[0];
    if (item?.id && bindWindowFn[item?.id]) {
      (bindWindowFn[item?.id] as Function)();
      delete bindWindowFn[item?.id];
    }

    if (item && isSpadActive(item)) {
      await niriSendActionArrSequence([
        {
          MoveWindowToWorkspace: {
            window_id: item.id,
            focus: false,
            reference: { Name: SpadWorkspaceName },
          },
        },
        {
          ToggleWindowFloating: { id: item.id },
        },
      ]);
      return;
    }

    const currentWorkspaceId = state.currentWorkspaceId;
    if (!item) {
      excuse(config.cmd, {});
      item = await waitWindowOpen(matchFn);
      // return;
    }
    await niriSendActionArrSequence([
      {
        MoveWindowToWorkspace: {
          window_id: item.id,
          focus: false,
          reference: { Id: currentWorkspaceId },
        },
      },
      {
        SetWindowHeight: { id: item.id, change: { SetFixed: config.height } },
      },
      {
        SetWindowWidth: { id: item.id, change: { SetFixed: config.width } },
      },

      {
        MoveWindowToFloating: { id: item.id },
      },
      {
        FocusWindow: { id: item.id },
      },
      { sleep: 0.1 },
      {
        CenterWindow: { id: item.id },
      },
    ]);
    item.workspace_id = currentWorkspaceId;

    bindWindowFn[item.id] = onWindowBlur(item, async () => {
      await niriSendActionArr([
        {
          MoveWindowToWorkspace: {
            window_id: item.id,
            focus: false,
            reference: { Name: SpadWorkspaceName },
          },
        },
        { sleep: 0.1 },
        {
          ToggleWindowFloating: { id: item.id },
        },
      ]);
      return;
    });
  };
}
