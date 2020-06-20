import { Listener, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';
import { Tag } from '@entities/Tag';

export default class MessageInvalidListener extends Listener {
  constructor() {
    super('messageInvalid', {
      emitter: 'commandHandler',
      event: 'messageInvalid',
    });
  }

  async exec(message: Message) {
    const getPrefix = this.client.commandHandler.prefix as PrefixSupplier;

    const prefix = getPrefix(message) as string;

    if (!message.content.startsWith(prefix)) return null;

    const tag = message.content.slice(1).split(' ')[0];

    const storedTag = await Tag.findOne({
      where: {
        name: tag,
      },
    });

    if (!storedTag) return null;

    await Tag.update(
      {
        name: tag,
      },
      {
        usages: storedTag.usages + 1,
      },
    );

    return message.channel.send(storedTag.content);
  }
}
