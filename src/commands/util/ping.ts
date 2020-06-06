import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class Ping extends Command {
  constructor() {
    super('ping', {
      aliases: ['ping'],
    });
  }

  exec(message: Message) {
    return message.reply('Pong!');
  }
}
