import { Command, Argument, PrefixSupplier } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { oneLine } from 'common-tags';
import { QueryFailedError } from 'typeorm';

import { Tag } from '~/database/entities/Tag';

import colors from '~/config/colors';

export default class TagAddCommand extends Command {
  constructor() {
    super('tag-add', {
      aliases: ['tag-add'],
      category: 'util',
      args: [
        {
          id: 'name',
          type: Argument.validate('string', (_, name) => name.length <= 20),
          prompt: {
            start: 'What will be the tag name?\n',
            retry: 'Sorry, the name cannot be greater than 20 characters.',
          },
        },
        {
          id: 'content',
          match: 'rest',
          type: Argument.validate(
            'string',
            (_, content) => content.length >= 10 && content.length <= 1000,
          ),
        },
      ],
    });
  }

  async exec(message: Message, { name, content }: { [x: string]: string }) {
    try {
      const { modules } = this.handler;
      if (modules.has(name)) {
        return message.reply('The tag name cannot be a command name!');
      }
      await Tag.insert({
        name,
        content,
        guildId: message.guild?.id,
        userId: message.author.id,
      });
    } catch (err) {
      if (err instanceof QueryFailedError && err.message.includes('UNIQUE')) {
        return message.reply(`A tag with name \`${name}\` already exists`);
      }
    }
    const getPrefix = this.handler.prefix as PrefixSupplier;
    const prefix = getPrefix(message);
    const embed = new MessageEmbed().setColor(colors.success).setDescription(
      oneLine`Successfully created a tag with name **${name}**
            you can check using \`${prefix}${name}\``,
    );
    return message.channel.send(embed);
  }
}
