import net from "net";
import { createInterface } from "readline";

const SOCKET_PATH = process.env.NIRI_SOCKET || "/tmp/niri.sock";

// 创建 Unix Socket 连接
const client = net.createConnection({ path: SOCKET_PATH }, () => {
  console.log("Connected to socket");

  // 发送初始请求（等价于 write_all）
  client.write('"EventStream"\n');
});

// 创建 readline 接口，实现按行读取
const rl = createInterface({
  input: client,
  crlfDelay: Infinity,
});

// 队列式读取下一行（类似 _queue_next_line_read）
rl.on("line", (line) => {
  console.log("Received line:", line);
  // 这里可以处理事件流，每收到一行就处理
});

// 错误处理
client.on("error", (err) => {
  console.error("Socket error:", err);
});

// 连接关闭
client.on("end", () => {
  console.log("Disconnected from socket");
});
