import { state } from "..";
import { useWorkspaceWindows } from "../state/useStateHook";
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
  const getWorkspaceWindows = useWorkspaceWindows(state);
  const { workspaces, windows } = state;
  let active_window_id: number | undefined;

  let workspaceWindows = [];
  for (const [_, workspace] of workspaces) {
    if (workspace.output !== output || !workspace.is_active) {
      continue;
    }
    active_window_id = workspace.active_window_id;
    workspaceWindows = getWorkspaceWindows(workspace.id);
    for (const [, window] of windows) {
      if (window.workspace_id !== workspace.id) {
        continue;
      }
    }
    break;
  }
  if (!active_window_id) {
    return "";
  }
  console.log(`test:>workspaceWindows`, workspaceWindows);
  let index = workspaceWindows.findIndex(
    (item) => item.id === active_window_id
  );
  const allNum = workspaceWindows.length;
  const title = windows.get(active_window_id!)?.title;
  if (!title) {
    return "";
  }
  return `${index + 1}/${allNum} ${title}`;
}
