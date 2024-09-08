import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { Importance } from '../utilities/common/publication-level.enum';
@Entity('publications')
export class PublicationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  publication_imagen: string;

  @Column()
  publication_title: string;

  @Column({ type: 'text' })
  publication_content: string;

  @Column({
    type: 'enum',
    enum: Importance,
    array: true,
    default: [Importance.MEDIO],
  })
  publication_importance: Importance[];

  @Column({
    type: 'boolean',
    default: true,
  })
  publication_active: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  publication_create_at: Timestamp;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  publication_update_at: Timestamp;
}
