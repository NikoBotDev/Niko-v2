import { Message, MessageEmbed } from 'discord.js';
import { Command, Argument } from 'discord-akairo';

import colors from '~/config/colors';

export default class ReloadCommand extends Command {
  constructor() {
    super('reload', {
      aliases: ['reload', 'rel'],
      ownerOnly: true,
      category: 'owner',
      description: {
        content: 'Reload a command',
        usage: '[command]',
      },
      args: [
        {
          id: 'command',
          description: 'command to reload',
          type: Argument.union('command', 'commandAlias'),
          prompt: {
            start: 'What command you want to be reloaded?\n',
            retry: 'I cannot find that command, try again.',
          },
        },
      ],
    });
  }

  exec(message: Message, { command }: { command: Command }) {
    command.reload();
    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setDescription(`The command ${command} has been reloaded!`);
    return message.channel.send('', embed);
  }
}
