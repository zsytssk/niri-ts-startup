import { excuse } from "../../utils/exec";
import { sleep } from "../../utils/utils";

export async function powerActions() {
  const result = await excuse(
    `echo "🔒 Lock\n🔚 Logout\n⛔ Shutdown\n🔄 Reboot" | fuzzel -d -p "请选择: "`
  );
  if (result == "🔒 Lock") {
    excuse("swaylock");
    await sleep(3);
    await excuse("systemctl suspend");
    return;
  }
  if (result == "🔚 Logout") {
    excuse("niri msg action quit --skip-confirmation", {});
    return;
  }
  if (result == "🔄 Reboot") {
    excuse("reboot", {});
    return;
  }
  if (result == "⛔ Shutdown") {
    // "shutdown" "-h" "now"
    excuse("shutdown -h now", {});
    return;
  }
}
