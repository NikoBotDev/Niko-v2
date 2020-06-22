import { Command } from 'discord-akairo';
import { Message, MessageEmbed, GuildMember } from 'discord.js';
import { oneLine, stripIndent } from 'common-tags';

import { Profile } from '@entities/Profile';
import { getConnection } from 'typeorm';

export default class DivorceCommand extends Command {
  constructor() {
    super('divorce', {
      aliases: ['divorce'],
      category: 'level',
      clientPermissions: ['EMBED_LINKS'],
      cooldown: 30000,
      description: {
        content: stripIndent`Divorce...
        You will need **1000** coins to use this command`,
        usage: '<member>',
        example: '@Niko',
      },
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: {
            start: 'What user you want to divorce with?',
          },
        },
      ],
    });
  }

  async exec(message: Message, { member }: { member: GuildMember }) {
    const authorRow = await Profile.findOne({
      where: {
        userId: message.author.id,
      },
    });
    const memberRow = await Profile.findOne({
      where: {
        userId: member.id,
      },
    });
    if (!memberRow || !authorRow) {
      return message.reply(
        oneLine`Sorry, you or the user you mentioned doesn't
        have an account, please type anything to make one!`,
      );
    }
    if (authorRow.coins < 1000) {
      return message.reply('You need **1000** coins to divorce');
    }
    try {
      await getConnection().transaction(async manager => {
        await manager.update(Profile, authorRow, {
          coins: authorRow.coins - 1000,
          married: null,
        });
        await manager.update(Profile, memberRow, { married: null });
      });
    } catch (err) {
      return message.reply('Something went wrong.');
    }

    const embed = new MessageEmbed()
      .setDescription(`${message.author} and ${member} are now divorced 💔💔`)
      .setThumbnail(member.user.displayAvatarURL())
      .setImage(message.author.displayAvatarURL())
      .setTimestamp();
    return message.channel.send(embed);
  }
}
