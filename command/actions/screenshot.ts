import { state } from "../..";
import { useWaitScreenShot } from "../../state/useStateHook";
import { excuse } from "../../utils/exec";
import { niriSendActionArrSequence } from "../../utils/niri-client";

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
  const windows = [...state.windows].map((item) => ({
    title: item[1].title,
    id: item[1].id,
    app_id: item[1].app_id,
  }));
  const result = (await excuse(
    `echo "${windows
      .map((item, index) => `${index + 1}. ${item.title}(${item.app_id})`)
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
