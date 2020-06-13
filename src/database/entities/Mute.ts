// @ts-nocheck
import {
  Entity,
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Unique,
} from 'typeorm';

type UUIDV4 = string;

@Entity({
  name: 'mutes',
})
export class Mute extends BaseEntity {
  @Column()
  @PrimaryColumn({
    unique: true,
  })
  id: UUIDV4;

  @Column()
  @Unique('userId_guildId_unique', ['userId', 'guildId'])
  userId: string;

  @Column()
  modId: string;

  @Column()
  guildId: string;

  @Column()
  endDate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
