import { Command } from 'discord-akairo';
import { Message, GuildMember } from 'discord.js';

type BlacklistAddCommandArgs = { member: GuildMember };
export default class BlacklistAddCommand extends Command {
  constructor() {
    super('blacklist-add', {
      aliases: ['blacklist-add'],
      category: 'admin',
      clientPermissions: ['EMBED_LINKS'],
      userPermissions: ['MANAGE_GUILD'],
      description: {
        content: 'Add a user into server blacklist',
        usage: '<user>',
      },
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: {
            start: 'What member you want to be blacklisted?\n',
          },
        },
      ],
    });
  }

  async exec(msg: Message, { member }: BlacklistAddCommandArgs) {
    if (!msg.guild) {
      return null;
    }

    const blacklist = this.client.settings.get<string[]>(
      msg.guild.id,
      'blacklist',
      [],
    );
    blacklist!.push(member.id);

    await this.client.settings.set(msg.guild.id, 'blacklist', blacklist);
    return msg.reply(
      `Successfully blacklisted ${member.displayName}(${member.id}) in this server`,
    );
  }
}
