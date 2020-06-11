// @ts-nocheck
import { Entity, BaseEntity, Column, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'settings',
})
export class Setting extends BaseEntity {
  @Column()
  @PrimaryColumn({ unique: true })
  guild_id: string;

  @Column({
    type: 'text',
  })
  settings: string;
}
