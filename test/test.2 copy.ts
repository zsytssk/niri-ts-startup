import net from "net";

const SOCKET_PATH = process.env.NIRI_SOCKET || "/tmp/niri.sock";

const client = net.createConnection({ path: SOCKET_PATH }, () => {
  console.log(`test:>1`);
  // client.write(JSON.stringify({ Action: { ScreenshotScreen: {} } }) + "\n");
  setTimeout(() => {
    client.write(
      JSON.stringify({ Action: { CenterWindow: { id: 8 } } }) + "\n",
    );
  }, 1000);
  setTimeout(() => {
    client.end();
  }, 2000);
});
