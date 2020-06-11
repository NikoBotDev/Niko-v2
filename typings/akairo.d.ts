/* eslint-disable no-unused-vars */
import { CommandHandler } from 'discord-akairo';
import TypeORMProvider from '~/database/providers/TypeORMProvider';

declare module 'discord-akairo' {
  interface AkairoClient {
    commandHandler: CommandHandler;
    settings: TypeORMProvider;
  }
}
