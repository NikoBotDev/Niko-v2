// @ts-nocheck
import { Entity, BaseEntity, Column } from 'typeorm';

export interface Settings {
  greeting?: {
    channel: string;
    message: string;
  };
  bye?: {
    channel: string;
    message: string;
  };
  prefix?: string;
}

@Entity({
  name: 'settings',
})
export class Setting extends BaseEntity {
  @Column('varchar', {
    primary: true,
  })
  guild_id: string;

  @Column('json')
  settings: Settings;
}
