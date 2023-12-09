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
