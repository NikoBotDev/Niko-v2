/*
Disable typescript strict type checking
because it does not work well with typeorm entities
*/
// @ts-nocheck
import {
  Entity,
  BaseEntity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Length } from 'class-validator';

@Entity({
  name: 'reminders',
})
export class Reminder extends BaseEntity {
  @Column()
  @PrimaryColumn({ unique: false })
  userId: string;

  @Column()
  guildId: string;

  @Column()
  channelId: string;

  @Column()
  @Length(10, 1000, {
    message: 'Reminder message must be 10~1000 characters long',
  })
  message: string;

  @Column()
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
