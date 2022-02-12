import {MigrationInterface, QueryRunner} from "typeorm";

export class initDb1644692025427 implements MigrationInterface {
    name = 'initDb1644692025427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`currency\` (\`id\` int NOT NULL AUTO_INCREMENT, \`currency_type_id\` int NOT NULL, \`contract_address_id\` int NOT NULL, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`clan\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`clan_id\` int NOT NULL, \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`address\` (\`id\` int NOT NULL AUTO_INCREMENT, \`currency_id\` int NOT NULL, \`user_id\` int NOT NULL, \`address_value\` varchar(255) NOT NULL, \`balance\` int NOT NULL, \`balance_precision\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`currency_type\` (\`id\` int NOT NULL AUTO_INCREMENT, \`issuer\` varchar(255) NOT NULL, \`value\` varchar(255) NOT NULL, \`issued_at\` datetime NOT NULL, \`expire_at\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`log\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`severity\` varchar(255) NOT NULL, \`message\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`transaction\` (\`id\` int NOT NULL AUTO_INCREMENT, \`address_from_id\` int NOT NULL, \`address_to_id\` int NOT NULL, \`amount\` int NOT NULL, \`precision\` int NOT NULL, \`type\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`issuer\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`value\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`issued_at\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`expire_at\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`issuer\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`value\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`issued_at\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`expire_at\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_7f3da65917b252e500cea79daed\` FOREIGN KEY (\`clan_id\`) REFERENCES \`clan\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`address\` ADD CONSTRAINT \`FK_4efef099192eb82ad8bac1f612a\` FOREIGN KEY (\`currency_id\`) REFERENCES \`currency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`address\` ADD CONSTRAINT \`FK_35cd6c3fafec0bb5d072e24ea20\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_133b478d5719208cb5696b1b7b8\` FOREIGN KEY (\`address_from_id\`) REFERENCES \`address\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_9db55f7dca552ea57e50aa53bb6\` FOREIGN KEY (\`address_to_id\`) REFERENCES \`address\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_9db55f7dca552ea57e50aa53bb6\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_133b478d5719208cb5696b1b7b8\``);
        await queryRunner.query(`ALTER TABLE \`address\` DROP FOREIGN KEY \`FK_35cd6c3fafec0bb5d072e24ea20\``);
        await queryRunner.query(`ALTER TABLE \`address\` DROP FOREIGN KEY \`FK_4efef099192eb82ad8bac1f612a\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_7f3da65917b252e500cea79daed\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`expire_at\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`issued_at\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`value\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`issuer\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`expire_at\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`issued_at\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`value\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`issuer\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`transaction\``);
        await queryRunner.query(`DROP TABLE \`log\``);
        await queryRunner.query(`DROP TABLE \`currency_type\``);
        await queryRunner.query(`DROP TABLE \`address\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`clan\``);
        await queryRunner.query(`DROP TABLE \`currency\``);
    }

}
