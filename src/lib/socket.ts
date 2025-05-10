import { io ,Socket} from "socket.io-client"

export const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3970';

export const newSocket : Socket=io(SOCKET_SERVER_URL);
