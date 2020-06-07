import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';

import colors from '~/config/colors';

export default class DogCommand extends Command {
  constructor() {
    super('dog', {
      aliases: ['dog'],
      category: 'search',
      clientPermissions: ['EMBED_LINKS'],
      description: {
        content: 'Get a random dog image from random.dog',
      },
    });
  }

  public async exec(message: Message) {
    const response = await axios.get<string>('http://random.dog/woof', {
      responseType: 'text',
    });
    if (response.status !== 200) return null;
    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setImage(`http://random.dog/${response.data}`);
    return message.channel.send(message.author, embed);
  }
}
