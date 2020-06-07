import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { stringify } from 'querystring';
import axios from 'axios';

import colors from '~/config/colors';

interface AwwnimeAPIResponse {
  cdnUrl: string;
}

export default class AwwnimeCommand extends Command {
  constructor() {
    super('awwnime', {
      aliases: ['awwnime', 'moe', 'cute', 'acte'],
      category: 'search',
      description: {
        content: 'Get a random hyper super duper cute image from awwnime',
        usage: '<tags>',
      },
      args: [
        {
          id: 'tags',
          match: 'separate',
          type: (_, phrase: string) => phrase.split(' '),
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

  public async exec(message: Message, { tags }: { tags: string[] }) {
    try {
      const response = await axios.get<AwwnimeAPIResponse[]>(this.getUrl(tags));

      const images = response.data;
      if (images.length === 0) {
        return message.reply('No images found');
      }
      const image = images[Math.floor(Math.random() * images.length)].cdnUrl;
      const embed = new MessageEmbed()
        .setColor(colors.love)
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(tags.join(', '))
        .setImage(image)
        .setFooter('Powered by Awwnime');
      return message.util!.send(embed);
    } catch (error) {}
  }

  private getUrl(tags: string[]) {
    const query = stringify({
      limit: 100,
      q: tags.join(' '),
    });
    return `https://awwnime.redditbooru.com/images/?${query}`;
  }
}
