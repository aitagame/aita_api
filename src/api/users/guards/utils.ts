import { Socket } from "socket.io";
import { User } from "../user.model";

export function isUserAuthorized(client: Socket) {
  return !!client.handshake.auth.user && client.handshake.auth.user instanceof User;
}