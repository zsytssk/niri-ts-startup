import { state } from "../../..";
import {
  niriSendAction,
  niriSendActionArrSequence,
} from "../../utils/niri-client";

/** 重置所有window workspace的位置 */
export async function resetState() {
  const {
    currentWindowId,
    windows,
    workspaces,
    originWindowInfo,
    originWorkspaceInfo,
  } = state;
  const activeWorkspace = [];
  for (const [_, workspace] of workspaces) {
    if (workspace.is_active) {
      if (workspace.is_focused) {
        activeWorkspace.push(workspace.id);
      } else {
        activeWorkspace.unshift(workspace.id);
      }
    }
  }

  for (const [_, window] of windows) {
    const originInfo = originWindowInfo.get(window.id);
    if (!originInfo) {
      originWindowInfo.delete(window.id);
      continue;
    }
    if (window.workspace_id !== originInfo.workspace) {
      await niriSendActionArrSequence([
        {
          MoveWindowToWorkspace: {
            window_id: window.id,
            focus: false,
            reference: { Id: originInfo.workspace },
          },
        },
      ]);
    }
  }

  for (const [_, workspace] of workspaces) {
    const originInfo = originWorkspaceInfo.get(workspace.id);
    if (!originInfo) {
      originWorkspaceInfo.delete(workspace.id);
      continue;
    }
    if (workspace.output !== originInfo.output) {
      await niriSendActionArrSequence([
        {
          MoveWorkspaceToMonitor: {
            output: originInfo.output,
            reference: {
              Id: workspace.id,
            },
          },
        },
        {
          MoveWorkspaceToIndex: {
            index: originInfo.idx,
            reference: {
              Id: workspace.id,
            },
          },
        },
      ]);
    }
  }

  for (const item of activeWorkspace) {
    await niriSendAction({
      FocusWorkspace: {
        reference: {
          Id: item,
        },
      },
    });
  }

  await niriSendAction({
    FocusWindow: { id: currentWindowId },
  });
}
