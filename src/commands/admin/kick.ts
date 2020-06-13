import { Command, Argument } from 'discord-akairo';
import { MessageEmbed, GuildMember, Message } from 'discord.js';

import colors from '~/config/colors';

type KickCommandArguments = { member: GuildMember; reason?: string };

export default class KickCommand extends Command {
  constructor() {
    super('kick', {
      aliases: ['kick'],
      category: 'admin',
      description: {
        content: 'Kicks the member out of the server.',
        usage: '<member> [reason]',
        examples: ['@toxicmember he is toxic'],
      },
      ratelimit: 2,
      clientPermissions: ['KICK_MEMBERS'],
      userPermissions: ['KICK_MEMBERS'],
      args: [
        {
          id: 'member',
          type: Argument.validate(
            'member',
            (_, _phrase, member: GuildMember) =>
              member.id !== member.guild.ownerID && member.kickable,
          ),
          prompt: {
            start: 'What member you want to kick?\n',
            retry: "I can't find or kick that user, maybe pick another one?",
          },
        },
        {
          id: 'reason',
          type: Argument.validate(
            'string',
            (_, reason) => reason.length <= 1200,
          ),
          prompt: {
            optional: true,
          },
          match: 'rest',
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { member, reason }: KickCommandArguments,
  ) {
    await member.kick(reason);

    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setTitle('Action: Kick')
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(
        `🚷 The user **__${member.user.username}(${member.id})__** has been kicked!`,
      )
      .setFooter(message.author.tag, message.author.displayAvatarURL());

    if (reason) {
      embed.addField('Reason', reason);
    }

    return message.channel.send(embed);
  }
}
