import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class SayCommand extends Command {
  constructor() {
    super('say', {
      aliases: ['say'],
      category: 'util',
      description: {
        content: 'say something',
      },
      args: [
        {
          id: 'text',
          match: 'rest',
        },
      ],
    });
  }

  public async exec(message: Message, { text }: { text: string }) {
    return message.channel.send(`${text} - ${message.member?.displayName}`);
  }
}
