import { Command, Argument } from 'discord-akairo';
import { Message, GuildMember, MessageEmbed } from 'discord.js';

import colors from '~/config/colors';

type BanCommandArguments = { member: GuildMember; reason?: string };

export default class BanCommand extends Command {
  constructor() {
    super('ban', {
      aliases: ['ban'],
      category: 'admin',
      description: {
        content: 'Apply ban in a member.',
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
            (_, reason: string) => reason.length <= 1200,
          ),
          prompt: {
            optional: true,
          },
          match: 'rest',
        },
      ],
    });
  }

  async exec(message: Message, { member, reason }: BanCommandArguments) {
    await member.ban({ reason, days: 2 });

    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setTitle('Action: Ban')
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(
        `☣ **__${member.user.username}(${member.id})__** have been banned!`,
      )
      .addField('Reason', reason)
      .setFooter(message.author.tag, message.author.displayAvatarURL());
    return message.channel.send(embed);
  }
}
