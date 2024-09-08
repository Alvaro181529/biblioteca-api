import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1725686492238 implements MigrationInterface {
    name = 'Initial1725686492238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "category_name" character varying NOT NULL, "category_description" text NOT NULL, "category_create_at" TIMESTAMP NOT NULL DEFAULT now(), "category_update_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "authors" ("id" SERIAL NOT NULL, "author_name" character varying NOT NULL, "author_biografia" character varying, "author_create_at" TIMESTAMP NOT NULL DEFAULT now(), "author_update_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_d2ed02fabd9b52847ccb85e6b88" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "instruments" ("id" SERIAL NOT NULL, "instrument_name" character varying NOT NULL, "instrument_family" character varying NOT NULL, "intrument_create_at" TIMESTAMP NOT NULL DEFAULT now(), "intrument_update_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_44d772c3199b38559c5fb666eb6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_order_status_enum" AS ENUM('ESPERA', 'PRESTADO', 'DEVUELTO', 'CANCELADO')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "order_at" TIMESTAMP DEFAULT now(), "order_regresado_at" TIMESTAMP DEFAULT now(), "order_status" "public"."orders_order_status_enum" NOT NULL DEFAULT 'ESPERA', "book_quantities" json, "order_create_at" TIMESTAMP NOT NULL DEFAULT now(), "order_update_at" TIMESTAMP DEFAULT now(), "userId" integer, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "contents" ("id" SERIAL NOT NULL, "content_sectionTitle" character varying, "content_pageNumber" integer, "bookId" integer, CONSTRAINT "PK_b7c504072e537532d7080c54fac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."books_book_condition_enum" AS ENUM('BUENO', 'REGULAR', 'MALO')`);
        await queryRunner.query(`CREATE TABLE "books" ("id" SERIAL NOT NULL, "book_imagen" character varying, "book_inventory" character(15) NOT NULL, "book_isbn" character varying, "book_title_original" character varying NOT NULL, "book_title_parallel" character varying, "book_observation" text, "book_location" character varying, "book_acquisition_date" date, "book_price_type" character(10), "book_original_price" numeric(10,2) DEFAULT '0', "book_price_in_bolivianos" numeric(10,2) DEFAULT '0', "book_language" character varying, "book_type" character varying, "book_description" text, "book_condition" "public"."books_book_condition_enum" NOT NULL DEFAULT 'BUENO', "book_quantity" integer NOT NULL, "book_includes" text, "book_loan" integer NOT NULL DEFAULT '0', "book_create_at" TIMESTAMP NOT NULL DEFAULT now(), "book_update_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "registers" ("id" SERIAL NOT NULL, "register_ci" character varying, "register_contact" integer, "register_ubication" character varying, "register_professor" character varying, "register_create_at" TIMESTAMP NOT NULL DEFAULT now(), "register_update_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_c80e46007c1de9f8d1c59b3b9b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_rols_enum" AS ENUM('ADMIN', 'ESTUDIANTE', 'USUARIO', 'ROOT')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "rols" "public"."users_rols_enum" NOT NULL DEFAULT 'USUARIO', "created_At" TIMESTAMP NOT NULL DEFAULT now(), "update_At" TIMESTAMP NOT NULL DEFAULT now(), "register_id" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "REL_4aac8c7a53ca75c87c9cf0124e" UNIQUE ("register_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."publications_publication_importance_enum" AS ENUM('ALTO', 'MEDIO', 'BAJO')`);
        await queryRunner.query(`CREATE TABLE "publications" ("id" SERIAL NOT NULL, "publication_imagen" character varying, "publication_title" character varying NOT NULL, "publication_content" text NOT NULL, "publication_importance" "public"."publications_publication_importance_enum" array NOT NULL DEFAULT '{MEDIO}', "publication_active" boolean NOT NULL DEFAULT true, "publication_create_at" TIMESTAMP NOT NULL DEFAULT now(), "publication_update_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_2c4e732b044e09139d2f1065fae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "book_categories" ("book_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_76506a56b5e205f79d9cdfc39ef" PRIMARY KEY ("book_id", "category_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bf7e0293afeaeacbe28b7f96e4" ON "book_categories" ("book_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2f8815188674efa2fc146b329e" ON "book_categories" ("category_id") `);
        await queryRunner.query(`CREATE TABLE "author_book" ("book_id" integer NOT NULL, "author_id" integer NOT NULL, CONSTRAINT "PK_381301778d838777e5e53df1f27" PRIMARY KEY ("book_id", "author_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0ff619ecdfb79dccf3218494f0" ON "author_book" ("book_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_12f40a8bac53dadeecab5eb771" ON "author_book" ("author_id") `);
        await queryRunner.query(`CREATE TABLE "instument_book" ("book_id" integer NOT NULL, "instrument_id" integer NOT NULL, CONSTRAINT "PK_db587424ab00204ca87d922e6a2" PRIMARY KEY ("book_id", "instrument_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3614d96e4dc64136c5de152ed0" ON "instument_book" ("book_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a71af21847c7da9b5f33f7e037" ON "instument_book" ("instrument_id") `);
        await queryRunner.query(`CREATE TABLE "order_books" ("book_id" integer NOT NULL, "order_id" integer NOT NULL, CONSTRAINT "PK_65dd2032fd1042452944f339769" PRIMARY KEY ("book_id", "order_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5f4e1691f657aeb99b6e762f2d" ON "order_books" ("book_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e4f23c0293882ef950218763fd" ON "order_books" ("order_id") `);
        await queryRunner.query(`CREATE TABLE "category_register" ("register_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_c9f5ceac9516cb6f425f3118726" PRIMARY KEY ("register_id", "category_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5b1792de97a75e097bd3738ab7" ON "category_register" ("register_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_269b44623eeebf68d012fe9037" ON "category_register" ("category_id") `);
        await queryRunner.query(`CREATE TABLE "instument_register" ("register_id" integer NOT NULL, "instrument_id" integer NOT NULL, CONSTRAINT "PK_746c4bbb254701e2980c06b650b" PRIMARY KEY ("register_id", "instrument_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8205cb1f52769d5c9eaae9710f" ON "instument_register" ("register_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_05ebe747816b3048322e83b322" ON "instument_register" ("instrument_id") `);
        await queryRunner.query(`CREATE TABLE "book_register" ("register_id" integer NOT NULL, "book_id" integer NOT NULL, CONSTRAINT "PK_daf7944675ea01b75d3a8107a79" PRIMARY KEY ("register_id", "book_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f3804c9bc5d06b72501ad92acc" ON "book_register" ("register_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_83164c8d967b9b2f4438893925" ON "book_register" ("book_id") `);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contents" ADD CONSTRAINT "FK_a0f17e4abe97e89a083a208abd7" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_4aac8c7a53ca75c87c9cf0124eb" FOREIGN KEY ("register_id") REFERENCES "registers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book_categories" ADD CONSTRAINT "FK_bf7e0293afeaeacbe28b7f96e43" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "book_categories" ADD CONSTRAINT "FK_2f8815188674efa2fc146b329e5" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "author_book" ADD CONSTRAINT "FK_0ff619ecdfb79dccf3218494f08" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "author_book" ADD CONSTRAINT "FK_12f40a8bac53dadeecab5eb771a" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "instument_book" ADD CONSTRAINT "FK_3614d96e4dc64136c5de152ed02" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "instument_book" ADD CONSTRAINT "FK_a71af21847c7da9b5f33f7e0373" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_books" ADD CONSTRAINT "FK_5f4e1691f657aeb99b6e762f2d9" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "order_books" ADD CONSTRAINT "FK_e4f23c0293882ef950218763fd5" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "category_register" ADD CONSTRAINT "FK_5b1792de97a75e097bd3738ab7a" FOREIGN KEY ("register_id") REFERENCES "registers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "category_register" ADD CONSTRAINT "FK_269b44623eeebf68d012fe90372" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "instument_register" ADD CONSTRAINT "FK_8205cb1f52769d5c9eaae9710f8" FOREIGN KEY ("register_id") REFERENCES "registers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "instument_register" ADD CONSTRAINT "FK_05ebe747816b3048322e83b3221" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "book_register" ADD CONSTRAINT "FK_f3804c9bc5d06b72501ad92acc2" FOREIGN KEY ("register_id") REFERENCES "registers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "book_register" ADD CONSTRAINT "FK_83164c8d967b9b2f44388939253" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book_register" DROP CONSTRAINT "FK_83164c8d967b9b2f44388939253"`);
        await queryRunner.query(`ALTER TABLE "book_register" DROP CONSTRAINT "FK_f3804c9bc5d06b72501ad92acc2"`);
        await queryRunner.query(`ALTER TABLE "instument_register" DROP CONSTRAINT "FK_05ebe747816b3048322e83b3221"`);
        await queryRunner.query(`ALTER TABLE "instument_register" DROP CONSTRAINT "FK_8205cb1f52769d5c9eaae9710f8"`);
        await queryRunner.query(`ALTER TABLE "category_register" DROP CONSTRAINT "FK_269b44623eeebf68d012fe90372"`);
        await queryRunner.query(`ALTER TABLE "category_register" DROP CONSTRAINT "FK_5b1792de97a75e097bd3738ab7a"`);
        await queryRunner.query(`ALTER TABLE "order_books" DROP CONSTRAINT "FK_e4f23c0293882ef950218763fd5"`);
        await queryRunner.query(`ALTER TABLE "order_books" DROP CONSTRAINT "FK_5f4e1691f657aeb99b6e762f2d9"`);
        await queryRunner.query(`ALTER TABLE "instument_book" DROP CONSTRAINT "FK_a71af21847c7da9b5f33f7e0373"`);
        await queryRunner.query(`ALTER TABLE "instument_book" DROP CONSTRAINT "FK_3614d96e4dc64136c5de152ed02"`);
        await queryRunner.query(`ALTER TABLE "author_book" DROP CONSTRAINT "FK_12f40a8bac53dadeecab5eb771a"`);
        await queryRunner.query(`ALTER TABLE "author_book" DROP CONSTRAINT "FK_0ff619ecdfb79dccf3218494f08"`);
        await queryRunner.query(`ALTER TABLE "book_categories" DROP CONSTRAINT "FK_2f8815188674efa2fc146b329e5"`);
        await queryRunner.query(`ALTER TABLE "book_categories" DROP CONSTRAINT "FK_bf7e0293afeaeacbe28b7f96e43"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_4aac8c7a53ca75c87c9cf0124eb"`);
        await queryRunner.query(`ALTER TABLE "contents" DROP CONSTRAINT "FK_a0f17e4abe97e89a083a208abd7"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_83164c8d967b9b2f4438893925"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f3804c9bc5d06b72501ad92acc"`);
        await queryRunner.query(`DROP TABLE "book_register"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_05ebe747816b3048322e83b322"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8205cb1f52769d5c9eaae9710f"`);
        await queryRunner.query(`DROP TABLE "instument_register"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_269b44623eeebf68d012fe9037"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5b1792de97a75e097bd3738ab7"`);
        await queryRunner.query(`DROP TABLE "category_register"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e4f23c0293882ef950218763fd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5f4e1691f657aeb99b6e762f2d"`);
        await queryRunner.query(`DROP TABLE "order_books"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a71af21847c7da9b5f33f7e037"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3614d96e4dc64136c5de152ed0"`);
        await queryRunner.query(`DROP TABLE "instument_book"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_12f40a8bac53dadeecab5eb771"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ff619ecdfb79dccf3218494f0"`);
        await queryRunner.query(`DROP TABLE "author_book"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2f8815188674efa2fc146b329e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bf7e0293afeaeacbe28b7f96e4"`);
        await queryRunner.query(`DROP TABLE "book_categories"`);
        await queryRunner.query(`DROP TABLE "publications"`);
        await queryRunner.query(`DROP TYPE "public"."publications_publication_importance_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_rols_enum"`);
        await queryRunner.query(`DROP TABLE "registers"`);
        await queryRunner.query(`DROP TABLE "books"`);
        await queryRunner.query(`DROP TYPE "public"."books_book_condition_enum"`);
        await queryRunner.query(`DROP TABLE "contents"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_order_status_enum"`);
        await queryRunner.query(`DROP TABLE "instruments"`);
        await queryRunner.query(`DROP TABLE "authors"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
