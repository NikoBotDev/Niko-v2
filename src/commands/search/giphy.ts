import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { oneLine } from 'common-tags';
import axios from 'axios';

import colors from '~/config/colors';

interface GiphyAPIResponse {
  images: {
    original: {
      url: string;
    };
  };
}

const { GIPHY_KEY } = process.env;
export default class GiphyCommand extends Command {
  constructor() {
    super('giphy', {
      aliases: ['giphy', 'gpy'],
      category: 'search',
      description: {
        content: oneLine`Get a random gif from giphy which
                can or not be related to te given tags`,
        usage: '<tags>',
      },
      args: [
        {
          id: 'tags',
          match: 'separate',
          prompt: {
            start: [
              'What tags you want to search?\n',
              'Type `stop` when you are done.',
            ],
            infinite: true,
          },
        },
      ],
    });
  }

  async exec(message: Message, { tags }: { tags: string[] }) {
    const offset = Math.floor(Math.random() * 4 + 1);
    const response = await axios.get<GiphyAPIResponse[]>(
      'http://api.giphy.com/v1/gifs/search',
      {
        params: {
          q: tags.join(' '),
          api_key: GIPHY_KEY,
          limit: 30,
          offset,
        },
      },
    );
    const gifs = response.data;
    const index = Math.floor(Math.random() * gifs.length);
    const gif = gifs[index];
    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setImage(gif.images.original.url)
      .setFooter('Powered by Giphy api');
    return message.channel.send(embed);
  }
}
