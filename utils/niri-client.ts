import { NiriSocket } from "./niri-socket";
import { sleep } from "./utils";

export function niriEventStream(fn: (data: any) => void) {
  const socket = NiriSocket();
  if (!socket) {
    return;
  }

  socket.on("connected", () => {
    socket.send("EventStream");
  });

  // 缓存未处理的数据
  let buffer = "";
  // 处理接收数据
  socket.on("data", (chunk) => {
    buffer += chunk.toString();

    // 按行处理
    let lines = buffer.split("\n");
    buffer = lines.pop()!; // 保留最后可能不完整的一行

    for (const line of lines) {
      fn(JSON.parse(line));
    }
  });

  return () => socket.end();
}

let localClient: ReturnType<typeof NiriSocket>;
function getClient() {
  if (!localClient) {
    localClient = NiriSocket();
  }
  return localClient;
}

export async function niriSendAction(obj: any) {
  const client = await getClient();
  return new Promise<void>((resolve, reject) => {
    client?.send({ Action: obj }, (err: any) => {
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
      client?.send({ Action: obj }, (err: any) => {
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
    if (obj.sleep) {
      await sleep(obj.sleep);
      continue;
    }
    await new Promise<void>((resolve, reject) => {
      client?.send({ Action: obj }, (err: any) => {
        if (err) reject(err);
        setTimeout(() => {
          resolve();
        }, 10);
      });
    });
  }
}
