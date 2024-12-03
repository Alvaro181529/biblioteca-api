import { Expose } from 'class-transformer';
import { BookEntity } from 'src/books/entities/book.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('contents')
export class ContentEntity {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ nullable: true })
  @Expose()
  content_sectionTitle: string;

  @Column({ nullable: true })
  @Expose()
  content_sectionTitleParallel: string;

  @Column({ nullable: true })
  @Expose()
  content_pageNumber: number;

  @ManyToOne(() => BookEntity, (book) => book.book_contents)
  @Expose()
  book: BookEntity;
}
