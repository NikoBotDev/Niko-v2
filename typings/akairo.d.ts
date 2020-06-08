import { CommandHandler } from 'discord-akairo';
import Niko from './classes/Niko';

declare module 'discord-akairo' {
  interface AkairoClient {
    commandHandler: CommandHandler;
  }
}
