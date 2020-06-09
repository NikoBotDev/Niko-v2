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

@Entity({
  name: 'streams',
})
export class Stream extends BaseEntity {
  @Column()
  @PrimaryColumn({ unique: false })
  channelId: string;

  @Column()
  guildId: string;

  @Column({
    nullable: true,
    length: 255,
  })
  message?: string;

  @Column()
  username: string;

  @Column({
    default: false,
  })
  streaming: boolean;

  @Column()
  startedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
