import { state } from "../../..";
import { useWorkspaceWindows } from "../../state/useStateHook";
import { niriSendAction } from "../../utils/niri-client";

export async function focusNextWindow() {
  const { currentWorkspaceId } = state;
  const getWindows = useWorkspaceWindows(state);

  const windows = getWindows(currentWorkspaceId!);
  if (!windows.length) {
    return;
  }
  const curIndex = windows.findIndex((item) => item.is_focused);
  let nextIndex = curIndex + 1;
  if (nextIndex === windows.length) {
    nextIndex = 0;
  }
  const nextWindow = windows[nextIndex];

  await niriSendAction({
    FocusWindow: { id: nextWindow.id },
  });
}
