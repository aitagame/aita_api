import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import ormConfig from "../../ormconfig";

const DBModule = TypeOrmModule.forRootAsync({
    imports: [ConfigModule.forRoot()],
    useFactory: () => ormConfig,
    inject: [ConfigService],
});

export default DBModule;
