import { MigrationInterface, QueryRunner } from "typeorm";

export class Create1725735177929 implements MigrationInterface {
    name = 'Create1725735177929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" ADD "book_document" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "book_document"`);
    }

}
