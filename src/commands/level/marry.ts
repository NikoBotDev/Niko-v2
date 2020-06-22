import { Command, Argument } from 'discord-akairo';
import { Message, MessageEmbed, GuildMember } from 'discord.js';
import { oneLine, stripIndent } from 'common-tags';

import { Profile } from '@entities/Profile';
import { getConnection } from 'typeorm';

import colors from '~/config/colors';

export default class MarryCommand extends Command {
  constructor() {
    super('marry', {
      aliases: ['marry'],
      category: 'level',
      clientPermissions: ['EMBED_LINKS'],
      cooldown: 30000,
      description: {
        content: stripIndent`Marry with a member.
        You will need **1000** coins to use this command`,
        usage: '<member>',
        example: '@Niko',
      },
      args: [
        {
          id: 'member',
          type: Argument.validate('member', (msg, _, member) => {
            if (member.id === msg.author.id) return false;
            return true;
          }),
          prompt: {
            start: 'What user you want to get married?',
            retry:
              'You cannot marry with yourself or with bots, pick another member!',
          },
        },
      ],
    });
  }

  async exec(message: Message, { member }: { member: GuildMember }) {
    const author = await Profile.findOne({
      where: {
        userId: message.author.id,
      },
    });
    const user = await Profile.findOne({
      where: {
        userId: member.id,
      },
    });
    if (!user || !author) {
      return message.reply(
        oneLine`Sorry, you or the mentioned member doesn't
        have an account, please type anything to make one!`,
      );
    }
    if (author.married || user.married) {
      return message.reply(
        `You are breaking the main rule of marriage: don't try to steal or betray.`,
      );
    }
    if (author.coins < 1000) {
      return message.reply('You need **1000** coins to marry');
    }
    await message.reply(
      `Hey ${member} do you accept marry with ${message.author}?\nType \`yes\` or \`no\``,
    );
    const allowed = await this.getUserResponse(message, member);
    if (!allowed || allowed === 'no') {
      return message.reply(oneLine`That user doesn't want to marry with you!`);
    }
    await getConnection().transaction(async manager => {
      await manager.update(Profile, author, {
        coins: author.coins - 1000,
        married: member.id,
      });
      await manager.update(Profile, user, {
        married: author.userId,
      });
    });

    const embed = new MessageEmbed()
      .setColor(colors.love)
      .setDescription(`${message.author} and ${member} are now married!!!`)
      .setThumbnail(member.user.displayAvatarURL())
      .setImage(message.author.displayAvatarURL())
      .setTimestamp();
    return message.channel.send(embed);
  }

  async getUserResponse(message: Message, member: GuildMember) {
    return new Promise(resolve => {
      const filter = (msg: Message) => {
        return (
          ['yes', 'no'].includes(msg.content.toLowerCase()) &&
          msg.author.id === member.id
        );
      };
      const collector = message.channel.createMessageCollector(filter, {
        time: 30000,
        max: 1,
      });
      collector.once('collect', (msg: Message) => resolve(msg.content));
      collector.once('end', collection => {
        if (collection.size === 0) resolve(null);
        else resolve(collection.first()?.content);
      });
    });
  }
}
