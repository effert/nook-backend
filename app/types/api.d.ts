export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export interface Error {
  statusCode?: number
  status?: number
  message: string
}
