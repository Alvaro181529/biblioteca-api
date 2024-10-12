import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Roles } from '../utilities/common/user-role.enum';
import { RegisterEntity } from 'src/registers/entities/register.entity';
import { OrderEntity } from 'src/orders/entites/order.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Roles, default: Roles.USER })
  rols: Roles;

  @OneToOne(() => RegisterEntity, { eager: true })
  @JoinColumn({ name: 'register_id' })
  register: RegisterEntity;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_At: Timestamp;
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  update_At: Timestamp;
  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];
}
