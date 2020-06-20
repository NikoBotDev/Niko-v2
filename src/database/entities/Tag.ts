// @ts-nocheck
import {
  Entity,
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { Length } from 'class-validator';

@Entity({
  name: 'tags',
})
export class Tag extends BaseEntity {
  @Column('varchar', {
    length: 80,
    primary: true,
    unique: false,
  })
  @Length(3, 80, {
    message: 'Tag name must be 3~80 characters long',
  })
  name: string;

  @Column('text')
  content: string;

  @Column('varchar')
  guildId: string;

  @Column('varchar')
  userId: string;

  @Column('int')
  usages: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
