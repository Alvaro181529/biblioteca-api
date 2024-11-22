import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { Condition, MediaType } from '../utilities/common/book-dondition.enum';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { AuthorEntity } from 'src/authors/entities/author.entity';
import { InstrumentEntity } from 'src/instruments/entities/instrument.entity';
import { OrderEntity } from 'src/orders/entites/order.entity';
import { ContentEntity } from 'src/contents/entities/content.entity';
import { Exclude } from 'class-transformer';
@Entity('books')
export class BookEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  book_imagen: string;
  @Column({ nullable: true })
  book_document: string;

  @Column({ type: 'char', length: 15 })
  book_inventory: string;

  @Column({ nullable: true })
  book_isbn: string;

  @Column()
  book_title_original: string;

  @Column({ nullable: true })
  book_title_parallel: string;

  @Column({ type: 'text', nullable: true })
  book_observation: string;

  @Column({ nullable: true })
  book_location: string;

  @Column({ type: 'date', nullable: true })
  book_acquisition_date: Date;

  @Column({ type: 'char', length: 10, nullable: true })
  book_price_type: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  book_original_price: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  book_price_in_bolivianos: number;

  @Column({ nullable: true })
  book_language: string;

  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.OTHER,
    nullable: true,
  })
  book_type: MediaType; //libro, partitura, revista

  @Column({ nullable: true })
  book_editorial: string;

  @Column({ type: 'text', nullable: true })
  book_description: string;

  @Column({
    type: 'enum',
    enum: Condition,
    default: Condition.REGULAR,
  })
  book_condition: Condition;

  @Column('int')
  book_quantity: number;

  @Column({ type: 'simple-array', nullable: true })
  book_includes: string[];

  @Column({ type: 'simple-array', nullable: true })
  book_headers: string[];

  @Column({ type: 'int', default: 0 })
  book_loan: number;

  @ManyToMany(() => CategoryEntity, (category) => category.books, {
    cascade: true,
    nullable: true,
  })
  @JoinTable({
    name: 'book_categories',
    joinColumn: { name: 'book_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  book_category: CategoryEntity[];

  @ManyToMany(() => AuthorEntity, (author) => author.books, {
    cascade: true,
    nullable: true,
  })
  @JoinTable({
    name: 'author_book',
    joinColumn: { name: 'book_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'author_id', referencedColumnName: 'id' },
  })
  book_authors: AuthorEntity[];

  @ManyToMany(() => InstrumentEntity, (author) => author.books, {
    cascade: true,
    nullable: true,
  })
  @JoinTable({
    name: 'instument_book',
    joinColumn: { name: 'book_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'instrument_id', referencedColumnName: 'id' },
  })
  book_instruments: InstrumentEntity[];
  @OneToMany(() => ContentEntity, (content) => content.book)
  @Exclude()
  book_contents: ContentEntity[];
  @ManyToMany(() => OrderEntity, (order) => order.books)
  @JoinTable({
    name: 'order_books',
    joinColumn: { name: 'book_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'order_id', referencedColumnName: 'id' },
  })
  orders: OrderEntity[];
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  book_create_at: Timestamp;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  book_update_at: Timestamp;
}
