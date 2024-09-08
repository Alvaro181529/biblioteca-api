import { BookEntity } from 'src/books/entities/book.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
@Entity('authors')
export class AuthorEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  author_name: string;
  @ManyToMany(() => BookEntity, (book) => book.book_authors)
  books: BookEntity[];
  @Column({ nullable: true })
  author_biografia: string;
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  author_create_at: Timestamp;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  author_update_at: Timestamp;
}
