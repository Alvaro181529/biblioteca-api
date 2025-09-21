import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('logs')
export class LogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: 'CREATE' | 'UPDATE' | 'DELETE';

  @Column()
  entity: string;

  @Column({ nullable: true })
  entityId: string;

  @Column()
  user: string;

  @Column({ nullable: true, type: 'json' })
  changes: any;

  @CreateDateColumn()
  timestamp: Date; // Fecha del log
}
