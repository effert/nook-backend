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
  const roomId = ctx.query.roomId
  const files = ctx.request.files!.file

  // 检查 file 是单个文件还是文件数组
  const file = Array.isArray(files) ? files[0] : files

  if (file && file.filepath) {
    const fileContent = fs.readFileSync(file.filepath, "utf8")
    const messages = JSON.parse(fileContent)

    for (const message of messages) {
      message.roomId = roomId
    }
    await MessageModal.importRoomMessage(messages)

    ctx.body = ctx.__("Message imported")
  } else {
    ctx.status = 400
    ctx.body = ctx.__("Invalid file upload")
  }
}

/**
 * 删除房间内所有消息
 * @param roomId
 */
export async function deleteRoomMessage(ctx: Context) {
  const { roomId } = ctx.request.body as { roomId: string }
  await MessageModal.deleteRoomMessage(roomId)
  ctx.body = ctx.__("Message deleted")
}
