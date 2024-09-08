import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../utilities/common/order-status.enum';
import { BookEntity } from 'src/books/entities/book.entity';
import { UserEntity } from 'src/users/entities/user.entity';
@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  order_at: Date;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  order_regresado_at: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.ESPERA,
  })
  order_status: OrderStatus;

  @Column('json', { nullable: true })
  book_quantities: { [bookId: number]: number };

  @ManyToMany(() => BookEntity, (book) => book.orders)
  books: BookEntity[];

  @ManyToOne(() => UserEntity, (user) => user.orders)
  user: UserEntity;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  order_create_at: Timestamp;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  order_update_at: Timestamp;
}
