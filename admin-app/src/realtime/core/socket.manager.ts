import { io, type Socket } from 'socket.io-client'

import { sessionStorage } from '@/features/auth/login/store/sessionStorage'

let socket: Socket | null = null
let currentToken: string | null = null

const deriveSocketUrl = (): string => {
  const explicitUrl = import.meta.env.VITE_SOCKET_URL as string | undefined
  if (explicitUrl) {
    return explicitUrl
  }

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) 
  if(!apiBaseUrl){
    throw new Error("VITE_API_BASE_URL is not configure, but required for socket")
  }
  try {
    const parsed = new URL(apiBaseUrl)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return apiBaseUrl
  }
}

const getSocketToken = () => {
  return sessionStorage.getSession()?.socketToken ?? null
}

const buildSocket = (): Socket => {
  const token = getSocketToken()
  currentToken = token

  return io(deriveSocketUrl(), {
    transports: ['websocket'],
    autoConnect: false,
    withCredentials: true,
    path: '/socket.io',
    extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
    auth: token ? { token } : undefined,
    query: token ? { token } : undefined,
  })
}

export const getSocket = (): Socket => {
  if (!socket) {
    socket = buildSocket()
  }

  return socket
}

export const connectSocket = (): Socket => {
  const latestToken = getSocketToken()

  if (!socket || latestToken !== currentToken) {
    socket?.removeAllListeners()
    socket?.disconnect()
    socket = buildSocket()
  }
 
  if (!socket.connected && !socket.active) {
    socket.connect()
  }

  return socket
}

export const disconnectSocket = () => {
  socket?.removeAllListeners()
  socket?.disconnect()
  socket = null
  currentToken = null
}

export const isConnected = () => {
  return Boolean(socket?.connected)
}
