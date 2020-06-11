import { CommandHandler } from 'discord-akairo';
import Niko from './classes/Niko';
import TypeORMProvider from '~/database/providers/TypeORMProvider';

declare module 'discord-akairo' {
  interface AkairoClient {
    commandHandler: CommandHandler;
    settings: TypeORMProvider;
  }
}
