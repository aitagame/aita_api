import { MigrationInterface, QueryRunner } from "typeorm";

export class createProfiles1645297824408 implements MigrationInterface {
    name = 'createProfiles1645297824408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`profile\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`class\` varchar(255) NOT NULL, \`gamesTotal\` int NOT NULL, \`gamesWon\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`profile\` ADD CONSTRAINT \`FK_d752442f45f258a8bdefeebb2f2\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`profile\` DROP FOREIGN KEY \`FK_d752442f45f258a8bdefeebb2f2\``);
        await queryRunner.query(`DROP TABLE \`profile\``);
    }

}
