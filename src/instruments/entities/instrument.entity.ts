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

@Entity('instruments')
export class InstrumentEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  instrument_name: string;
  @Column()
  instrument_family: string;
  @ManyToMany(() => BookEntity, (book) => book.book_instruments)
  books: BookEntity[];
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  intrument_create_at: Timestamp;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  intrument_update_at: Timestamp;
}
