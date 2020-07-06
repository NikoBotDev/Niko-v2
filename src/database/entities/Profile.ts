// @ts-nocheck
import {
  Entity,
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  AfterInsert,
} from 'typeorm';

@Entity({
  name: 'profiles',
})
export class Profile extends BaseEntity {
  @Column('varchar', {
    unique: true,
    primary: true,
  })
  userId: string;

  @Column('int', {
    default: 1,
  })
  level: number;

  @Column('int', {
    default: 1,
  })
  xp: number;

  @Column('int', {
    default: 0,
  })
  coins: number;

  @Column('varchar', {
    nullable: true,
  })
  married: string | null;

  @Column('varchar', {
    default: "'default'",
  })
  profile_bg: string;

  @Column('json', {
    default: [],
  })
  badges: string[];

  @Column('timestamp', {
    default: () => 'NOW()',
  })
  daily: Date;

  @Column('int', {
    default: 0,
  })
  streak: number;

  @CreateDateColumn({
    default: () => 'NOW()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    default: () => 'NOW()',
  })
  updatedAt: Date;
}
