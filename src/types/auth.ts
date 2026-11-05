import type { User } from './user'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResult {
  token: string
  user: User
}
