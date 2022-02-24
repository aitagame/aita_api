import {MigrationInterface, QueryRunner} from "typeorm";

export class addPublicKey1645658459636 implements MigrationInterface {
    name = 'addPublicKey1645658459636'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`access_key\` RENAME COLUMN \`value\` TO functional_key`);
        await queryRunner.query(`ALTER TABLE \`access_key\` ADD \`public_key\` varchar(255) NOT NULL AFTER functional_key`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`access_key\` RENAME COLUMN \`functional_key\` TO value`);
        await queryRunner.query(`ALTER TABLE \`access_key\` DROP COLUMN \`public_key\``);
    }

}
