import net from "net";

const SOCKET_PATH = process.env.NIRI_SOCKET || "/tmp/niri.sock";

// action := fmt.Sprintf(`{"Action":{"MoveWindowToWorkspace":{"window_id":%d,"focus":false,"reference":{"Id":%d}}}}`,
// 		windowID, workspaceID,
// 	)
// def center(self):
//         niri_request({"Action": {"CenterWindow": {"id": int(self.id)}}})

//     def focus(self):
//         niri_request({"Action": {"FocusWindow": {"id": int(self.id)}}})

//     def close(self):
//         niri_request({"Action": {"CloseWindow": {"id": int(self.id)}}})
// 模拟多次发送请求
//
setTimeout(() => {
  const client = net.createConnection({ path: SOCKET_PATH }, () => {
    console.log("Connected to socket");

    // 发送初始事件
    //   sendRequest('"EventStream"');
    // client.write(Buffer.from(JSON.stringify("EventStream") + "\n"), "utf-8");

    // client.write(
    //   JSON.stringify({ Action: { ScreenshotScreen: {} } }) + "\n",
    //   () => {
    //     client.end();
    //   },
    // );
    client.write(
      JSON.stringify({ Action: { CenterWindow: { id: 8 } } }) + "\n",
      () => {
        client.end();
      },
    );
  });
  //   client.write(
  //     Buffer.from(JSON.stringify({ Action: "Screenshot" }) + "\n"),
  //     "utf-8"
  //   );
}, 1000);
