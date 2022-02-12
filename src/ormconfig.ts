import * as path from "path";
import * as dotenv from "dotenv";
import { ConnectionOptions } from "typeorm";

dotenv.config({ path: path.join(__dirname, '../.env') });

const config: ConnectionOptions = {
    type: 'mysql',
    host: process.env['DB_HOST'],
    port: +process.env['DB_PORT'],
    username: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_NAME'],

    entities: [path.join(__dirname, './api/**/*.model{.ts,.js}')],
    extra: {
        connectionLimit: 5
    },
    synchronize: false,
    migrations: [path.join(__dirname, './storage/database/migrations/**/*{.ts,.js}')],
    cli: {
        migrationsDir: 'src/storage/database/migrations',
    }
}

export default config;