import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PrefixCommand extends Command {
  constructor() {
    super('prefix', {
      aliases: ['prefix', 'px'],
      category: 'admin',
      userPermissions: ['MANAGE_GUILD'],
      channel: 'guild',
      description: {
        content: 'Displays or changes the prefix of the guild.',
        usage: '[prefix]',
        examples: ['>'],
      },
      args: [
        {
          id: 'prefix',
          default: '',
        },
      ],
    });
  }

  async exec(message: Message, { prefix }: { prefix: string }) {
    const oldPrefix = this.client.settings.get<string>(
      message.guild!.id,
      'prefix',
      '!b',
    )!;
    if (!prefix) {
      return message.reply(`The prefix for this server is **${oldPrefix}**`);
    }
    await this.client.settings.set(message.guild!.id, 'prefix', prefix);
    return message.reply(`Prefix changed from ${oldPrefix} to ${prefix}`);
  }
}
