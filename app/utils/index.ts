import crypto from "crypto"
import { ApiResponse } from "@/types/api"

export function generateRandomString(length: number) {
  return crypto.randomBytes(length).toString("hex")
}

export function response<T>(
  success: boolean,
  message: string,
  data?: T
): ApiResponse<T> {
  return { success, message, data }
}

/**
 * 重试函数
 * @param operation
 * @param maxRetries
 * @returns
 */
export async function executeWithRetry(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      if (error.message.includes("write conflict") && attempt < maxRetries) {
        // 可以在这里添加一些延迟（例如使用 setTimeout）
        await new Promise((resolve) => setTimeout(resolve, 1000))
        continue
      }
      throw error
    }
  }
}
