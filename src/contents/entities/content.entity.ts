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
  content_sectionTitle: string; // Título de la sección en el índice

  @Column({ nullable: true })
  @Expose()
  content_pageNumber: number; // Página en la que se encuentra la sección

  @ManyToOne(() => BookEntity, (book) => book.book_contents)
  @Expose()
  book: BookEntity;
}
