import net from "net";

const SOCKET_PATH = process.env.NIRI_SOCKET || "/tmp/niri.sock";

const client = net.createConnection({ path: SOCKET_PATH }, () => {
  // 发送初始事件
  // sendRequest('"EventStream"');
  // client.write(Buffer.from(JSON.stringify("EventStream") + "\n"), "utf-8");
  // client.write(JSON.stringify({ Action: "Screenshot" }) + "\n");
  // client.write(
  //   JSON.stringify({ Action: { FocusWindow: { id: 7 } } }) + "\n",
  //   (err) => {
  //     if (err) throw err;
  //     client.end();
  //   }
  // );
  client.write(
    JSON.stringify({ Action: { FocusWindow: { id: 8 } } }) + "\n",
    (err) => {
      if (err) throw err;
      // client.end();
    },
  );
  client.write(
    JSON.stringify({
      Action: {
        Screenshot: { show_pointer: true },
      },
    }) + "\n",
    (err) => {
      if (err) throw err;
      // client.end();
    },
  );
  // client.write(
  //   JSON.stringify({
  //     Action: {
  //       MoveWindowToWorkspace: {
  //         window_id: 9,
  //         focus: true,
  //         reference: { Id: 6 },
  //       },
  //     },
  //   }) + "\n"
  // );
  // client.write(
  //   JSON.stringify({ Action: { CenterWindow: { id: 9 } } }) + "\n",
  //   (err) => {
  //     if (err) throw err;
  //     client.end();
  //   }
  // );
});
