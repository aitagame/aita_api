import {MigrationInterface, QueryRunner} from "typeorm";

export class addUsers1644689196016 implements MigrationInterface {
    name = 'addUsers1644689196016'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`currency\` (\`id\` int NOT NULL AUTO_INCREMENT, \`currency_id\` int NOT NULL, \`user_id\` int NOT NULL, \`address_value\` varchar(255) NOT NULL, \`balance\` int NOT NULL, \`balance_precision\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`currency_type\` (\`id\` int NOT NULL AUTO_INCREMENT, \`issuer\` varchar(255) NOT NULL, \`value\` varchar(255) NOT NULL, \`issued_at\` datetime NOT NULL, \`expire_at\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`clan\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`log\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`severity\` varchar(255) NOT NULL, \`message\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`transaction\` (\`id\` int NOT NULL AUTO_INCREMENT, \`address_from_id\` int NOT NULL, \`address_to_id\` int NOT NULL, \`amount\` int NOT NULL, \`precision\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`clan_id\` int NOT NULL, \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`currency_id\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`address_value\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`balance\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`balance_precision\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`issuer\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`value\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`issued_at\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`expire_at\``);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`currency_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`user_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`address_value\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`balance\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`balance_precision\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`issuer\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`value\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`issued_at\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`expire_at\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`currency_type_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`contract_address_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`code\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`name\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`code\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`contract_address_id\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`currency_type_id\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`expire_at\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`issued_at\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`value\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` DROP COLUMN \`issuer\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`balance_precision\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`balance\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`address_value\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`currency_id\``);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`expire_at\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`issued_at\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`value\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency_type\` ADD \`issuer\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`balance_precision\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`balance\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`address_value\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`user_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`currency_id\` int NOT NULL`);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`transaction\``);
        await queryRunner.query(`DROP TABLE \`log\``);
        await queryRunner.query(`DROP TABLE \`clan\``);
        await queryRunner.query(`DROP TABLE \`currency_type\``);
        await queryRunner.query(`DROP TABLE \`currency\``);
    }

}
