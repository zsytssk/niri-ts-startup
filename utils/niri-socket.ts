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

export function niriSendAction(obj: any) {
  return new Promise<void>((resolve, reject) => {
    const client = net.createConnection({ path: SOCKET_PATH! }, () => {
      client.write(JSON.stringify({ Action: obj }) + "\n", (err) => {
        if (err) reject(err);
        client.end();
        resolve();
      });
    });
  });
}

// 同时发送多个命令
export function niriSendActionArr(arr: Array<any>) {
  return new Promise<void>((resolve, reject) => {
    const client = net.createConnection({ path: SOCKET_PATH! }, async () => {
      const taskList = [] as Promise<any>[];
      for (const obj of arr) {
        const task = new Promise<void>((resolve) => {
          client.write(JSON.stringify({ Action: obj }) + "\n", (err) => {
            if (err) reject(err);
            resolve();
          });
        });
        taskList.push(task);
      }

      Promise.all(taskList).then(() => {
        client.end();
        resolve();
      });
    });
  });
}

// 一个一个的发送命令
export function niriSendActionArrSequence(arr: Array<any>) {
  return new Promise<void>((resolve, reject) => {
    const client = net.createConnection({ path: SOCKET_PATH! }, async () => {
      for (const obj of arr) {
        await new Promise<void>((resolve) => {
          client.write(JSON.stringify({ Action: obj }) + "\n", (err) => {
            if (err) reject(err);
            setTimeout(() => {
              resolve();
            }, 10);
          });
        });
      }
      resolve();
      client.end();
    });
  });
}
