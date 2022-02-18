import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUserIdToAccessKeyAndArrayOfAccessKeyInUser1645188704549 implements MigrationInterface {
    name = 'AddUserIdToAccessKeyAndArrayOfAccessKeyInUser1645188704549'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`access_key\` ADD CONSTRAINT \`FK_8bff331b150893bb5833f6e5675\` FOREIGN KEY (\`id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`access_key\` DROP FOREIGN KEY \`FK_8bff331b150893bb5833f6e5675\``);
    }

}
