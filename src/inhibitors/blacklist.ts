import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

class BlacklistInhibitor extends Inhibitor {
  constructor() {
    super('blacklist', {
      reason: 'blacklist',
    });
  }

  exec(message: Message) {
    const blacklist = ['218321983172983'];
    return blacklist.includes(message.author.id);
  }
}

export default BlacklistInhibitor;
