import { Command } from 'discord-akairo';
import { Message, MessageEmbed, GuildMember } from 'discord.js';
import format from 'date-fns/format';

import colors from '~/config/colors';

export default class UserInfoCommand extends Command {
  constructor() {
    super('user-info', {
      aliases: ['user-info', 'uinfo'],
      category: 'util',
      description: {
        content: 'Fetch member information and send it in a fashion way.',
        usage: '[member]',
      },
      channel: 'guild',
      ratelimit: 2,
      args: [
        {
          id: 'member',
          description: 'Member to get information about.',
          type: 'member',
          default: (message: Message) => message.member,
        },
      ],
    });
  }

  public exec(message: Message, { member }: { member: GuildMember }) {
    const { activities } = member.presence;
    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setAuthor(member.displayName, member.user.displayAvatarURL())
      .addField('ID', member.id, true)
      .addField(
        'Joined At',
        format(member.joinedAt as Date, 'MM-dd-yyyy HH:mm:ss') || '?',
      )
      .addField(
        'Joined Discord',
        format(member.user.createdTimestamp, 'MM-dd-yyyy HH:mm:ss') || '?',
      )
      .addField(
        'Roles',
        `**(${member.roles.cache.size - 1})** ${member.roles.cache
          .filter(({ id }) => id !== message.guild!.id)
          .map(({ name }) => name)
          .splice(0, 5)
          .join('\n')}`,
      )
      .addField('Status', member.presence.status);
    if (activities.length > 0) {
      embed.setFooter(`Now Playing: ${activities[0].name}`);
    }
    return message.util!.send('', embed);
  }
}
