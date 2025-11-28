import { state } from "../../..";
import { useWaitScreenShot } from "../../state/useStateHook";
import { excuse } from "../../utils/exec";
import { niriSendActionArrSequence } from "../../utils/niri-client";
import { compareString } from "../../utils/utils";

export async function screenshot() {
  const waitScreenShot = useWaitScreenShot(state);
  const path = await waitScreenShot();
  if (path) {
    await excuse(
      `satty --filename ${path} --actions-on-enter save-to-clipboard`
    );
  }
}
export async function selectWindow() {
  const workspaces = state.workspaces;
  const windows = [...state.windows]
    .filter(Boolean)
    .map((item) => {
      const workspace = workspaces.get(item[1].workspace_id);
      return {
        title: item[1].title,
        id: item[1].id,
        app_id: item[1].app_id,
        workspace: workspace.idx,
        output: workspace.output,
        idx: item[1].layout.pos_in_scrolling_layout?.[0] || 100,
      };
    })
    .sort((a, b) => {
      return (
        compareString(a.output, b.output) ||
        a.workspace - b.workspace ||
        a.idx - b.idx
      );
    });
  const result = (await excuse(
    `echo "${windows
      .map(
        (item, index) =>
          `${index + 1}. ${item.title}(${item.output}:${item.workspace}:${
            item.idx
          })`
      )
      .join("\n")}" | fuzzel -d -p "请选择: "`,
    {}
  )) as string;
  if (!result) {
    return;
  }
  const index = Number(result.split(".")[0]) - 1;
  const window = windows[index];
  if (!window) {
    return;
  }
  await niriSendActionArrSequence([
    {
      FocusWindow: { id: window.id },
    },
    {
      CenterWindow: { id: window.id },
    },
  ]);
}
