import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';

import colors from '~/config/colors';

interface NekoAPIResponse {
  neko: string;
}

export default class NekoCommand extends Command {
  constructor() {
    super('neko', {
      aliases: ['neko'],
      category: 'search',
      description: {
        content: 'Get a random nekomimi image from nekos.life',
      },
    });
  }

  public async exec(message: Message) {
    try {
      const response = await axios.get<NekoAPIResponse>(
        'https://nekos.life/api/neko',
      );
      const embed = new MessageEmbed()
        .setColor(colors.success)
        .setImage(response.data.neko);
      return message.channel.send('', embed);
    } catch (error) {
      if (error.response) return null;
      throw error;
    }
  }
}
