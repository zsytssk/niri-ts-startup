spad
hyprpanel

## 2025-10-30 14:17:19

- @ques spad 怎么监听失去焦点 -> onBlur

- @ques 怎么匹配 instance -> chrome

- @ques 怎么设置大小

```
setWindowWidth
setWindowHeight
CenterWindow
```

- @ques 怎么配置在一块

```lua
  module.chatgpt = lib_scratchpad.create {
    command = browser .. ' --app-id=cadlkienfkclaiaibeoongdcgmdikeeg', -- How to spawn the scratchpad
    rule = { instance = 'crx_cadlkienfkclaiaibeoongdcgmdikeeg' },      -- The rule that the scratchpad will be searched by
    geometry = { x = 360, y = 90, height = 900, width = 1200 },        -- The geometry in a floating state
    floating = true,
  }
```

```kdl

workspace "scratch"
window-rule {
    match app-id="nemo"
    open-on-workspace "scratch"
    open-floating truetest
    default-column-width { fixed 1157; }
    default-window-height { fixed 736; }
}
```

---

- @ques scratchpad 是怎么实现的

  - 打开 | 关闭

## 2025-10-30 13:24:55

- @ques 怎么隐藏显示这个窗口

  - 直接打开放在末尾?

[通过 socket 传递参数](https://yalter.github.io/niri/niri_ipc/enum.Action.html)

```ts
client.write(Buffer.from(JSON.stringify("EventStream") + "\n"));

client.write(
  JSON.stringify({
    Action: {
      Quit: { skip_confirmation: false },
    },
  }) + "\n"
);

client.write(
  JSON.stringify({
    Action: {
      Screenshot: { show_pointer: true },
    },
  }) + "\n"
);
```

eww? -> https://github.com/elkowar/eww
https://dharmx.is-a.dev/eww-powermenu/
https://github.com/gh0stzk/dotfiles

---

壁纸
hyprlock
其他细节功能

## 2025-10-29 11:09:19

https://github.com/AlguienSasaki/new-dots
https://github.com/EviLuci/dotfiles
https://github.com/greed-d/.dotfiles

---

https://github.com/isaksamsten/niriswitcher
https://github.com/probeldev/niri-float-sticky
https://github.com/ahmad9059/HyprFlux

### end

init 脚本同步数据 写入哪些需要同步的数据
自己写插件
