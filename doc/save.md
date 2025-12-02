```bash
sshfs -o StrictHostKeyChecking=no zsy@192.168.122.196:/home/zsy/.config /home/zsy/Documents/zsy/github/niri-test/vm_config
ssh -X zsy@192.168.122.196
```

https://github.com/Vortriz/awesome-niri

```
// 上次log
journalctl --user -u niri -b -1

// 这次log
journalctl --user -u niri -f
```

## 需要实现的功能

- @todo swap monitor

---

- 一个快捷键 在同一个应用的不同窗内切换

- @ques scratchpad

- @ques arch linux ?

### 2025-10-30 16:43:35

- @todo 关机选项

## 通过 socket 传递参数

[通过 socket 传递参数](https://yalter.github.io/niri/niri_ipc/enum.Action.html)

```ts
client.write(Buffer.from(JSON.stringify("EventStream") + "\n"));

client.write(
  JSON.stringify({
    Action: {
      Quit: { skip_confirmation: false },
    },
  }) + "\n",
  (err) => {
    if (err) throw err;
    client.end();
  }
);

client.write(
  JSON.stringify({
    Action: {
      Screenshot: { show_pointer: true },
    },
  }) + "\n",
  (err) => {
    if (err) throw err;
    client.end();
  }
);

client.write(
  JSON.stringify({
    Action: {
      MoveWindowToWorkspace: {
        window_id: 9,
        focus: true,
        reference: { Id: 6 },
      },
    },
  }) + "\n",
  (err) => {
    if (err) throw err;
    client.end();
  }
);
```

```
cliphist list | fuzzel --dmenu --with-nth 2 | cliphist decode | wl-copy
ydotool key 29:1 47:1 47:0 29:0
```
