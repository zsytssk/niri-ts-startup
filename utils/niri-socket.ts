import net from "net";

const SOCKET_PATH = process.env.NIRI_SOCKET;
export function niriEventStream(fn: (data: any) => void) {
  if (!SOCKET_PATH) {
    return;
  }

  // 创建连接
  const client = net.createConnection({ path: SOCKET_PATH }, () => {
    client.write(Buffer.from(JSON.stringify("EventStream") + "\n"), "utf-8");
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
      fn(JSON.parse(line));
    }
  });

  return () => client.end();
}

export function niriSend(obj: any) {
  return new Promise<void>((resolve, reject) => {
    const client = net.createConnection({ path: SOCKET_PATH! }, () => {
      client.write(JSON.stringify(obj) + "\n", (err) => {
        if (err) reject(err);
        client.end();
        resolve();
      });
    });
  });
}

export function niriSendGetRes(obj: any) {
  return new Promise((resolve, reject) => {
    const client = net.createConnection({ path: SOCKET_PATH! }, () => {
      let buffer = "";
      client.write(JSON.stringify(obj) + "\n", (err) => {
        if (err) reject(err);
        // client.end();
      });

      client.on("data", (chunk) => {
        buffer += chunk.toString();

        // 按行处理
        let lines = buffer.split("\n");
        buffer = lines.pop()!; // 保留最后可能不完整的一行

        resolve(JSON.parse(lines[0]));
      });
    });
  });
}
