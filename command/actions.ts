import { niriSend } from "../utils/niri-socket";

export async function actions(req: Response) {
  const data = await req.json(); // 解析 JSON body
  const { action } = data;

  switch (action) {
    case "next-column-center":
      await niriSend({
        Action: {
          FocusColumnRightOrFirst: {},
        },
      });
      await niriSend({
        Action: {
          CenterColumn: {},
        },
      });
      break;
  }
}
