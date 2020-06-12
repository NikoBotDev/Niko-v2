import { Command } from 'discord-akairo';
import { Message, GuildMember } from 'discord.js';

export default class BlacklistRemoveCommand extends Command {
  constructor() {
    super('blacklist-remove', {
      aliases: ['blacklist-remove'],
      category: 'admin',
      clientPermissions: ['EMBED_LINKS'],
      userPermissions: ['MANAGE_GUILD'],
      description: {
        content: 'Remove a user from server blacklist',
        usage: '<user>',
      },
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: {
            start: 'What member you want to remove?\n',
          },
        },
      ],
    });
  }

  async exec(message: Message, { member }: { member: GuildMember }) {
    if (!message.guild) {
      return null;
    }
    const blacklist = this.client.settings.get<string[]>(
      message.guild.id,
      'blacklist',
      [],
    );
    const userIndex = blacklist!.indexOf(member.id);
    blacklist!.splice(userIndex, 1);

    await this.client.settings.set(message.guild.id, 'blacklist', blacklist);
    return message.reply(
      `Successfully removed ${member.displayName}(${member.id}) from server blacklist!`,
    );
  }
}
