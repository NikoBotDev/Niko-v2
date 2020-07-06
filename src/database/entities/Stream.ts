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
  @Column('varchar', {
    primary: true,
    unique: false,
  })
  channelId: string;

  @Column('varchar')
  guildId: string;

  @Column('text', {
    nullable: true,
  })
  message?: string;

  @Column('varchar')
  username: string;

  @Column('boolean', {
    default: false,
  })
  streaming: boolean;

  @Column('timestamp')
  startedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
