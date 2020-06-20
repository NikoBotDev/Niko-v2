import { Command, Argument } from 'discord-akairo';
import { Message, GuildMember, MessageEmbed } from 'discord.js';

import colors from '~/config/colors';

type SoftBanCommandArguments = { member: GuildMember; reason: string };

export default class SoftBanCommand extends Command {
  constructor() {
    super('softban', {
      aliases: ['softban', 'sb'],
      category: 'admin',
      description: {
        content: 'Bans and then unbans after some seconds.',
        usage: '<member> [reason]',
        examples: ['@toxicmember he is toxic'],
      },
      ratelimit: 2,
      clientPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS'],
      args: [
        {
          id: 'member',
          type: Argument.validate(
            'member',
            (_, _phrase, member: GuildMember) =>
              member.id !== member.guild.ownerID && member.bannable,
          ),
          prompt: {
            start: 'What member you want to ban?\n',
            retry: "I can't find or ban that user, maybe pick another one?",
          },
        },
        {
          id: 'reason',
          type: Argument.validate(
            'string',
            (_, __, reason: string) => reason.length <= 1200,
          ),
          match: 'rest',
        },
      ],
    });
  }

  async exec(message: Message, { member, reason }: SoftBanCommandArguments) {
    if (!message.guild) return null;

    if (
      !member.bannable ||
      !SoftBanCommand.testHierarchy(message.member, member)
    ) {
      return null;
    }
    await member.ban({ reason, days: 2 });
    setTimeout(() => {
      message.guild!.members.unban(member, 'Soft ban timeout');
    }, 4e4);
    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setTitle('Action: Soft Ban')
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(
        `☢ The user **__${member.user.tag}(${member.id})__** has been soft banned!`,
      )
      .addField('Reason', reason)
      .setFooter(message.author.tag, message.author.displayAvatarURL());
    return message.channel.send(embed);
  }

  /**
   * Checks if moderator's highest role is higher than member's role
   */
  static testHierarchy(mod: GuildMember | null, member: GuildMember): boolean {
    const highestRolePosition = mod?.roles?.highest?.comparePositionTo(
      member.roles.highest,
    );
    return highestRolePosition ? highestRolePosition > 0 : false;
  }
}
