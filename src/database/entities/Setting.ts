// @ts-nocheck
import { Entity, BaseEntity, Column } from 'typeorm';

@Entity({
  name: 'settings',
})
export class Setting extends BaseEntity {
  @Column('varchar', {
    primary: true,
  })
  guild_id: string;

  @Column('json')
  settings: string;
}
