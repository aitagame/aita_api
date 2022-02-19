import { Module } from "@nestjs/common";
import { RoomsEventsGateway } from "./rooms.gateway";

@Module({
    imports: [],
    controllers: [],
    providers: [RoomsEventsGateway]
})
export class RoomsModule { };