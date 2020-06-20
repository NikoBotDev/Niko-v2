// @ts-nocheck
import {
  Entity,
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  AfterInsert,
} from 'typeorm';

function parseJSONColumns(row) {
  row.badges = JSON.parse(row.badges);
}

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

  @Column('varchar')
  married: string;

  @Column('varchar', {
    default: 'default',
  })
  profile_bg: string;

  @Column('text', {
    default: '[]',
  })
  badges: string;

  @Column('int', {
    default: 0,
  })
  streak: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @AfterInsert()
  afterInsert() {
    parseJSONColumns(this);
  }
}
