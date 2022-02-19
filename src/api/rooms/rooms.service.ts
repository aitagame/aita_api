import { Injectable } from "@nestjs/common";

@Injectable()
export class RoomsService {
    ping(): string {
        return 'Pong';
    }
}