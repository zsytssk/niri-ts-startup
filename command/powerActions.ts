import { excuse } from "../utils/exec";

export async function powerActions() {
  const result = await excuse(
    `echo -e "🔒 Lock\n🔚 Logout\n⛔ Shutdown\n🔄 Reboot" | fuzzel -d -p "请选择: "`,
    {}
  );
  if (result == "🔒 Lock") {
    excuse("hyprlock", {});
    return;
  }
  if (result == "🔚 Logout") {
    excuse("niri msg action quit", {});
    return;
  }
  if (result == "🔄 Reboot") {
    excuse("reboot", {});
    return;
  }
}
