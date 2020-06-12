import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

export default class BlacklistInhibitor extends Inhibitor {
  constructor() {
    super('blacklist', {
      reason: 'blacklist',
      type: 'pre',
    });
  }

  public exec(message: Message) {
    if (message.channel.type === 'dm' && !message.guild) return false;
    const blacklist = this.client.settings.get<string[]>(
      message.guild!.id,
      'blacklist',
      [],
    );
    return blacklist!.includes(message.author!.id);
  }
}
