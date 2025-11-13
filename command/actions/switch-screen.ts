import { state } from "../..";
import { niriSendActionArrSequence } from "../../utils/niri-client";

let isSwitch = false;
export async function switchScreen() {
  const { outputs, workspaces, currentWorkspaceId } = state;
  const curOutput = workspaces.get(currentWorkspaceId!)?.output;
  if (!curOutput || isSwitch) {
    return;
  }
  isSwitch = true;
  const curIndex = [...outputs].findIndex((item) => item == curOutput);
  let nextIndex = curIndex + 1;
  if (nextIndex >= outputs.size) {
    nextIndex = 0;
  }
  const nextOutput = [...outputs][nextIndex];
  const curOutputWorkspaces = [] as any[];
  const nextOutputWorkspaces = [] as any[];
  for (const [, item] of workspaces) {
    if (item.output == curOutput) {
      curOutputWorkspaces.push(item);
      continue;
    }
    if (item.output == nextOutput) {
      nextOutputWorkspaces.push(item);
      continue;
    }
  }
  curOutputWorkspaces.sort((a, b) => a.idx - b.idx);
  nextOutputWorkspaces.sort((a, b) => a.idx - b.idx);
  const task = [] as Promise<any>[];
  for (const item of [...curOutputWorkspaces, ...nextOutputWorkspaces]) {
    const output = item.output === curOutput ? nextOutput : curOutput;
    const actions: any[] = [
      {
        MoveWorkspaceToMonitor: {
          output: output,
          reference: {
            Id: item.id,
          },
        },
      },
      {
        MoveWorkspaceToIndex: {
          index: item.idx,
          reference: {
            Id: item.id,
          },
        },
      },
    ];
    if (item.is_active) {
      actions.push({
        FocusWorkspace: {
          reference: {
            Id: item.id,
          },
        },
      });
    }
    task.push(niriSendActionArrSequence(actions));
  }
  await Promise.all(task);
  isSwitch = false;
}
