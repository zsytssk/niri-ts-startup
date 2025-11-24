import { state } from "../../..";
import { useWaitWindowOpen } from "../../state/useStateHook";
import { excuse } from "../../utils/exec";
import {
  niriSendAction,
  niriSendActionArrSequence,
} from "../../utils/niri-client";
import { sleep } from "../../utils/utils";

export async function powerActions() {
  const result = await excuse(
    `echo "󰌾 Lock\n󰍃 Logout\n󰙧 Shutdown\n󰑐 Reboot\n󰚰 Update" | fuzzel -d -p "请选择: "`
  );
  // const result = await excuse(
  //   `echo "🔒 Lock\n🔚 Logout\n⛔ Shutdown\n🔄 Reboot" | rofi -dmenu -p  "请选择: "`
  // );
  if (result == "󰌾 Lock") {
    await excuse("swaylock --daemonize");
    await sleep(1);
    // await excuse("systemctl suspend");
    await niriSendAction({
      PowerOffMonitors: {},
    });
    return;
  }
  if (result == "󰍃 Logout") {
    excuse("niri msg action quit --skip-confirmation", {});
    return;
  }
  if (result == "󰑐 Reboot") {
    const res = await excuse(
      `notify-send "确定要重启吗？" -a "提示" -u normal -A yes=Yes -A no=No`,
      {}
    );
    if (res === "yes") {
      excuse("reboot", {});
    }
    return;
  }
  if (result == "󰙧 Shutdown") {
    const res = await excuse(
      `notify-send "确定要关机吗？" -a "提示" -u normal -A yes=Yes -A no=No`,
      {}
    );
    if (res === "yes") {
      excuse("shutdown -h now", {});
    }
    return;
  }
  if (result == "󰚰 Update") {
    excuse(
      `ghostty --title="Update System" --class="update.ghostty" -e sh -c "neofetch && sudo apt update && sudo apt upgrade; exec bash"`,
      {}
    );
    const waitWindowOpen = useWaitWindowOpen(state);
    const item = await waitWindowOpen((item: any) => {
      return item.app_id === "update.ghostty";
    });
    const currentWorkspaceId = state.currentWorkspaceId;
    await niriSendActionArrSequence([
      {
        MoveWindowToWorkspace: {
          window_id: item.id,
          focus: true,
          reference: { Id: currentWorkspaceId },
        },
      },
      {
        SetWindowHeight: { id: item.id, change: { SetFixed: 900 } },
      },
      {
        SetWindowWidth: { id: item.id, change: { SetFixed: 900 } },
      },
      {
        MoveWindowToFloating: { id: item.id },
      },
      { sleep: 0.1 },
      { FocusWindow: { id: item.id } },
      {
        CenterWindow: { id: item.id },
      },
    ]);
    return;
  }
}
