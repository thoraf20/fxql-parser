/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class FxqlStatement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 3 })
  sourceCurrency: string;

  @Column({ length: 3 })
  destinationCurrency: string;

  @Column('decimal', { precision: 10, scale: 5 })
  buyRate: number;

  @Column('decimal', { precision: 10, scale: 5 })
  sellRate: number;

  @Column('int')
  cap: number;

  @CreateDateColumn()
  createdAt: Date;
}
