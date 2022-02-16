import {MigrationInterface, QueryRunner} from "typeorm";

export class NullableClanIdAndChangePasswordNaming1645012555011 implements MigrationInterface {
    name = 'NullableClanIdAndChangePasswordNaming1645012555011'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`passwordHash\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`password\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_7f3da65917b252e500cea79daed\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`clan_id\` \`clan_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_7f3da65917b252e500cea79daed\` FOREIGN KEY (\`clan_id\`) REFERENCES \`clan\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_7f3da65917b252e500cea79daed\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`clan_id\` \`clan_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_7f3da65917b252e500cea79daed\` FOREIGN KEY (\`clan_id\`) REFERENCES \`clan\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`password\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`passwordHash\` varchar(255) NOT NULL`);
    }

}
