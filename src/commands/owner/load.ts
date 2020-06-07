import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { join } from 'path';

import colors from '~/config/colors';

export default class LoadCommand extends Command {
  constructor() {
    super('load', {
      aliases: ['load'],
      category: 'owner',
      ownerOnly: true,
      description: {
        content: 'Load a command',
        usage: '[command]',
        examples: ['category:alias'],
      },
      args: [
        {
          id: 'command',
          description: 'Command to be loaded, format: category:command',
          prompt: {
            start: 'What command you want to load?\n',
          },
        },
      ],
    });
  }

  async exec(message: Message, { command }: { command: string }) {
    const splitted = command.split(':');
    const path = join(__dirname, '..', splitted[0], `${splitted[1]}.js`);

    const commandObj = this.client.commandHandler.load(path);
    if (!commandObj) {
      return message.util!.reply('Failed to load the command');
    }
    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setDescription(`Successfully loaded the command ${commandObj.id}`);
    return message.util!.send('', embed);
  }
}
