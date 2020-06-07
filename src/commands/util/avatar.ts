import { Command } from 'discord-akairo';
import { Message, MessageEmbed, User } from 'discord.js';

import colors from '~/config/colors';

export default class AvatarCommand extends Command {
  constructor() {
    super('avatar', {
      aliases: ['avatar'],
      category: 'util',
      clientPermissions: ['EMBED_LINKS'],
      ratelimit: 2,
      description: {
        content: "Shows the user's avatar",
        usage: '[user]',
      },
      args: [
        {
          id: 'user',
          type: 'user',
          default: (message: Message) => message.author,
          description: 'User to fetch avatar',
          prompt: {
            start: 'What user would you like to get the avatar?\n',
            optional: true,
          },
        },
      ],
    });
  }

  public exec(message: Message, { user }: { user: User }) {
    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setDescription(`Avatar for **${user.tag}**`)
      .setImage(
        user.displayAvatarURL({
          format: 'png',
          size: 1024,
        })
      );
    return message.util!.send('', embed);
  }
}
