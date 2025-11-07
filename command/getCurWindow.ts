import { state } from "..";
import { excuse } from "../utils/exec";

const bind = new Map<string, boolean>();
function bindActiveWindowChange(output: string, signal: number) {
  // pkill -RTMIN+5 waybar
  if (bind.has(output)) {
    return;
  }
  bind.set(output, true);
  state.onEvent("FocusWindow", (window: any) => {
    if (!window) {
      excuse(`pkill -RTMIN+${signal} waybar`);
      return;
    }
    const windowOutput = state.workspaces.get(window.workspace_id)?.output;
    if (windowOutput !== output) {
      return;
    }
    excuse(`pkill -RTMIN+${signal} waybar`);
  });
}

export async function getCurWindow(req: Request) {
  const data = await req.json(); // 解析 JSON body
  const { output, signal } = data as Record<string, any>;
  bindActiveWindowChange(output, signal);
  const curState = state.getState();
  let active_window_id: number | undefined;
  for (const [id, workspace] of Object.entries(curState.workspaces)) {
    if (workspace.output === output && workspace.is_active) {
      active_window_id = workspace.active_window_id;
      break;
    }
  }
  if (!active_window_id) {
    return "";
  }
  return curState.windows[active_window_id]?.title || "";
}
