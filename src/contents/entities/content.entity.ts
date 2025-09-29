import { BookEntity } from 'src/books/entities/book.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('contents')
export class ContentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_CONTENT_TITLE')
  @Column({ nullable: true })
  content_sectionTitle: string;

  @Index('IDX_CONTENT_TITLE_PARALLEL')
  @Column({ nullable: true })
  content_sectionTitleParallel: string;

  @Column({ nullable: true })
  content_pageNumber: number;

  @ManyToOne(() => BookEntity, (book) => book.book_contents)
  book: BookEntity;
}
