import { Command } from 'discord-akairo';
import { Message, MessageEmbed, GuildMember } from 'discord.js';

import colors from '~/config/colors';

export default class WhosPlayingCommand extends Command {
  constructor() {
    super('whos-playing', {
      aliases: ['whos-playing', 'whpl'],
      category: 'util',
      channel: 'guild',
      args: [
        {
          id: 'game',
          type: 'lowercase',
          match: 'rest',
          prompt: {
            start: 'What game would you like to use as search query?',
          },
        },
      ],
    });
  }

  public exec(message: Message, { game }: { game: string }) {
    const members = message.guild?.members.cache.filter((member) =>
      this.gameFilter(member, game)
    );

    if (!members) {
      return;
    }

    if (members.size === 0) {
      return message.channel.send(`No one is playing ${game} right now`);
    }

    const stringArray = members.map(
      (member) => `**${member.displayName}${member.user.tag}**`
    );
    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setAuthor("Who's playing", message.guild?.iconURL() as string)
      .setDescription(stringArray.join('\n'))
      .setFooter(message.author.tag, message.author.avatarURL() as string)
      .setTimestamp();
    return message.channel.send(embed);
  }

  private gameFilter(member: GuildMember, game: string): boolean {
    if (
      member.presence.activities.length > 0 &&
      member.presence.activities[0].name.toLowerCase() === game.toLowerCase()
    ) {
      return true;
    }
    return false;
  }
}
