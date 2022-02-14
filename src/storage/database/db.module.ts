import { TypeOrmModule } from "@nestjs/typeorm";
import ormConfig from "../../ormconfig";

const DBModule = TypeOrmModule.forRootAsync({
    useFactory: () => ormConfig
});

export default DBModule;
