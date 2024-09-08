import { BookEntity } from 'src/books/entities/book.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { InstrumentEntity } from 'src/instruments/entities/instrument.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
@Entity('registers')
export class RegisterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  register_ci: string;

  @Column({ nullable: true })
  register_contact: number;

  @Column({ nullable: true })
  register_ubication: string;

  @ManyToMany(() => CategoryEntity, { eager: true })
  @JoinTable({
    name: 'category_register',
    joinColumn: { name: 'register_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  register_category: CategoryEntity[];

  @ManyToMany(() => InstrumentEntity, { eager: true })
  @JoinTable({
    name: 'instument_register',
    joinColumn: { name: 'register_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'instrument_id', referencedColumnName: 'id' },
  })
  register_intrument: InstrumentEntity[];
  @ManyToMany(() => BookEntity, { eager: true })
  @JoinTable({
    name: 'book_register',
    joinColumn: { name: 'register_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'book_id', referencedColumnName: 'id' },
  })
  register_liked: BookEntity[];
  @Column({ nullable: true })
  register_professor: string;
  @OneToOne(() => UserEntity, (user) => user.register)
  register_user: UserEntity;
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  register_create_at: Timestamp;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  register_update_at: Timestamp;
}
