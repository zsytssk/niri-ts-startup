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

let localClient: any;
async function getClient() {
  if (!localClient) {
    localClient = new Promise<any>((resolve) => {
      const client = net.createConnection({ path: SOCKET_PATH! }, () => {
        resolve(client);
      });
    });
  }
  if (localClient instanceof Promise) {
    return localClient.then((client) => {
      localClient = client;
      return client;
    });
  }
  return localClient;
}

export function niriSend(obj: any) {
  return new Promise<void>((resolve, reject) => {
    const client = net.createConnection({ path: SOCKET_PATH! }, () => {
      client.write(JSON.stringify(obj) + "\n", (err: any) => {
        if (err) reject(err);
        client.end();
        resolve();
      });
    });
  });
}

export async function niriSendAction(obj: any) {
  const client = await getClient();
  return new Promise<void>((resolve, reject) => {
    client.write(JSON.stringify({ Action: obj }) + "\n", (err: any) => {
      if (err) reject(err);
      resolve();
    });
  });
}

// 同时发送多个命令
export async function niriSendActionArr(arr: Array<any>) {
  const client = await getClient();
  const taskList = [] as any[];
  for (const obj of arr) {
    const task = new Promise<void>((resolve, reject) => {
      client.write(JSON.stringify({ Action: obj }) + "\n", (err: any) => {
        if (err) reject(err);
        resolve();
      });
    });
    taskList.push(task);
  }
  return Promise.all(taskList);
}

// 一个一个的发送命令
export async function niriSendActionArrSequence(arr: Array<any>) {
  const client = await getClient();
  for (const obj of arr) {
    await new Promise<void>((resolve, reject) => {
      client.write(JSON.stringify({ Action: obj }) + "\n", (err: any) => {
        if (err) reject(err);
        setTimeout(() => {
          resolve();
        }, 10);
      });
    });
  }
}
