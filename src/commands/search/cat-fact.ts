import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';

import colors from '~/config/colors';

interface CatFactResponse {
  fact: string;
}

export default class CatFactCommand extends Command {
  constructor() {
    super('cat-fact', {
      aliases: ['cat-fact', 'ctf'],
      category: 'search',
      description: {
        content: 'Get a random cat fact from catfact API',
      },
    });
  }

  public async exec(message: Message) {
    const response = await axios.get<CatFactResponse>(
      'https://catfact.ninja/fact'
    );
    if (response.status !== 200) return;
    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setTitle(':cat2: fact')
      .setDescription(response.data.fact);
    return message.channel.send('', embed);
  }
}
