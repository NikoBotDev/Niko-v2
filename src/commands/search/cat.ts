import { Command } from 'discord-akairo';
import { Message, MessageEmbed, MessageAttachment } from 'discord.js';
import axios from 'axios';
import { extname } from 'path';

import colors from '~/config/colors';

export default class CatCommand extends Command {
  constructor() {
    super('cat', {
      aliases: ['cat'],
      category: 'search',
      clientPermissions: ['EMBED_LINKS'],
      description: {
        content: 'Get a random cat image from thecatapi',
      },
    });
  }

  public async exec(message: Message) {
    try {
      const res = await axios.get<Buffer>(
        'http://thecatapi.com/api/images/get',
        {
          responseType: 'arraybuffer',
        },
      );

      const {
        data: image,
        request: {
          res: { responseUrl },
        },
      } = res;
      const ext = extname(responseUrl);
      const name = `cat.${ext}`;
      const embed = new MessageEmbed()
        .setColor(colors.success)
        .attachFiles([new MessageAttachment(image, name)])
        .setImage(`attachment://${name}`);
      return message.channel.send('', embed);
    } catch (error) {
      if (error.response) return null;
      throw error;
    }
  }
}
