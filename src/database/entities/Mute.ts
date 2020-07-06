// @ts-nocheck
import {
  Entity,
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

type UUIDV4 = string;

@Entity({
  name: 'mutes',
})
export class Mute extends BaseEntity {
  @Column('text', {
    primary: true,
    unique: true,
  })
  id: UUIDV4;

  @Column('varchar')
  @Unique('userId_guildId_unique', ['userId', 'guildId'])
  userId: string;

  @Column('varchar')
  modId: string;

  @Column('varchar')
  guildId: string;

  @Column('timestamp')
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
