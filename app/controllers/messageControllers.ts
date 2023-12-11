import { Context } from "koa"
import fs from "fs"
import path from "path"
import MessageModal from "@/models/messageModal"

/**
 * 导出房间内所有信息
 * @param roomId
 * @returns
 */

export async function exportMessage(ctx: Context) {
  const { roomId } = ctx.request.body as { roomId: string }
  const allMessage = await MessageModal.getRoomMessage(roomId)
  const formattedData = JSON.stringify(allMessage)
  const filename = `room-${roomId}-messages.json`
  const filePath = path.join(process.cwd(), "public", filename)

  fs.writeFileSync(filePath, formattedData)

  ctx.set("Content-disposition", `attachment; filename=${filename}`)
  ctx.set("Content-Type", "application/json")
  ctx.body = fs.createReadStream(filePath)
}

/**
 * 导入房间内所有信息
 * @param roomId
 * @param files
 * @returns
 */
export async function importMessage(ctx: Context) {
  const roomId = ctx.params.roomId
  const files = ctx.request.files!.file

  // 检查 file 是单个文件还是文件数组
  const file = Array.isArray(files) ? files[0] : files

  if (file && file.path) {
    const fileContent = fs.readFileSync(file.path, "utf8")
    const messages = JSON.parse(fileContent)

    for (const message of messages) {
      message.roomId = roomId
    }
    MessageModal.importRoomMessage(messages)

    ctx.body = "消息已导入"
  } else {
    ctx.status = 400
    ctx.body = "无效的文件上传"
  }
}
