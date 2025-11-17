import net from "net";

const SOCKET_PATH = process.env.NIRI_SOCKET;
export function NiriSocket() {
  if (!SOCKET_PATH) return;
  let client: net.Socket | undefined = undefined;
  let reconnectTimer: number | undefined = undefined;
  const eventMap = new Map<string, Set<(data?: any) => void>>();
  let shouldConnect = true;
  let status = "connecting" as `connecting` | "connected" | "end";

  const connect = () => {
    // 防止重复连接
    if (client) {
      try {
        client.destroy();
      } catch {}
      client = undefined;
    }
    client = net.createConnection({ path: SOCKET_PATH }, () => {
      status = "connected";
      const bindFns = eventMap.get("connected");
      if (bindFns) {
        for (const item of bindFns) {
          item();
        }
      }
    });

    client.on("data", (chunk) => {
      const bindFns = eventMap.get("data");
      if (bindFns) {
        for (const item of bindFns) {
          item(chunk);
        }
      }
    });

    client.on("error", (err) => {
      status = "connecting";
      scheduleReconnect();
    });

    client.on("close", () => {
      status = "connecting";
      scheduleReconnect();
    });
  };

  const scheduleReconnect = () => {
    if (!shouldConnect) {
      return;
    }
    if (reconnectTimer) return; // 已经在等待中
    reconnectTimer = setTimeout(() => {
      reconnectTimer = undefined;
      connect();
    }, 2000) as unknown as number; // 2 秒后重连
  };

  // 首次连接
  connect();

  const on = (event: string, callback: (data?: any) => void, once = false) => {
    let events = eventMap.get(event);
    if (!events) {
      events = new Set();
      eventMap.set(event, events);
    }
    if (once) {
      const fn = (data: any) => {
        callback(data);
        events.delete(fn);
      };
      events.add(fn);
    } else {
      events.add(callback);
    }
  };

  const once = (event: string, callback: (data?: any) => void) => {
    on(event, callback, true);
  };

  const send = (obj: string | Object, callback?: (err?: any) => void) => {
    if (status === "end") {
      return;
    }
    if (status === "connected") {
      client?.write(Buffer.from(JSON.stringify(obj) + "\n"), "utf-8", callback);
      return;
    }

    once("connected", () => {
      client?.write(Buffer.from(JSON.stringify(obj) + "\n"), "utf-8", callback);
    });
  };

  const end = () => {
    status = "end";
    shouldConnect = false;
    client?.end();
    client = undefined;
    eventMap.clear();
    clearTimeout(reconnectTimer);
  };

  return { send, on, end };
}
