import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

const DBModule = TypeOrmModule.forRootAsync({
    imports: [ConfigModule.forRoot()],
    useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),

        extra: {
            connectionLimit: 5,
            retryAttempts: 10,
            retryDelay: 3000
        }
    }),
    inject: [ConfigService],
});

export default DBModule;
