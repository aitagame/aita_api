import { HttpException } from "@nestjs/common";
import { assert } from "console";
import { Socket } from "socket.io";
import { User } from "../user.model";

export function getAuthorizedUser(client: any): User {
  assertIsSocket(client);
  return client.user as User;
}

export function setAuthorizedUser(client: any, user: User) {
  assertIsSocket(client);
  return client.user = user;
}

export function isUserAuthorized(client: any): boolean {
  assertIsSocket(client);
  return !!client.user && client.user instanceof User;
}

export function failUnauthorized(client: Socket): boolean {
  client.emit('error', new HttpException('Unauthorized', 401));
  client.disconnect();
  return false;
}

function assertIsSocket(client: any): void {
  assert(client instanceof Socket, new Error('Invalid client instance'));
}
