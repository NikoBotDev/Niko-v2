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
  @Column()
  @PrimaryColumn()
  @Length(3, 80, {
    message: 'Tag name must be 3~80 characters long',
  })
  name: string;

  @Column()
  content: string;

  @Column()
  guildId: string;

  @Column()
  userId: string;

  @Column()
  usages: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
