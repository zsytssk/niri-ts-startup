import net from "net";

const SOCKET_PATH = process.env.NIRI_SOCKET || "/tmp/niri.sock";

// 创建连接
const client = net.createConnection({ path: SOCKET_PATH }, () => {
  console.log("Connected to socket");

  // 发送初始事件
  //   sendRequest('"EventStream"');
  //   client.write(Buffer.from('"EventStream"\n', "utf-8"));
  client.write(Buffer.from(JSON.stringify("EventStream") + "\n"), "utf-8");
  //   client.write(JSON.stringify({ Action: "Screenshot" }) + "\n");
});

// 缓存未处理的数据
let buffer = "";

// 处理接收数据
client.on("data", (chunk) => {
  buffer += chunk.toString();

  // 按行处理
  let lines = buffer.split("\n");
  buffer = lines.pop()!; // 保留最后可能不完整的一行

  for (const line of lines) {
    console.log("Received:", line);
    // 这里可以处理事件
  }
});

// 发送请求函数
function sendRequest(req: string) {
  //   client.write('EventStream"\n');
  console.log(`test:>req`, req);
  client.write(req + "\n");
}

// 连接关闭
client.on("end", () => {
  console.log("Disconnected from socket");
});

// 错误处理
client.on("error", (err) => {
  console.error("Socket error:", err);
});

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

    // 处理接收数据
    client.on("data", (chunk) => {
      console.log(`test:>data:>2`);
      buffer += chunk.toString();

      // 按行处理
      let lines = buffer.split("\n");
      buffer = lines.pop()!; // 保留最后可能不完整的一行

      for (const line of lines) {
        console.log("Received:", line);
        // 这里可以处理事件
      }
    });

    // 发送初始事件
    //   sendRequest('"EventStream"');
    // client.write(Buffer.from(JSON.stringify("EventStream") + "\n"), "utf-8");

    // client.write(JSON.stringify({ Action: "ScreenshotScreen" }) + "\n");
    client.write(
      JSON.stringify({ Action: { CenterWindow: { id: 9 } } }) + "\n"
    );
  });
  //   client.write(
  //     Buffer.from(JSON.stringify({ Action: "Screenshot" }) + "\n"),
  //     "utf-8"
  //   );
}, 1000);
