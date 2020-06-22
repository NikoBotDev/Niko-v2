import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { findOrMake } from '~/util/profile';
import { addRewards, toNextLevel } from '~/util/xp';

export default class MessageListener extends Listener {
  constructor() {
    super('message', {
      emitter: 'client',
      event: 'message',
    });
  }

  async exec(message: Message) {
    if (message.author.bot) return;

    const user = await findOrMake({
      userId: message.author.id,
    });

    if (!user) return;

    addRewards(user);

    const nextLevelXp = toNextLevel(user.level, true) as number;
    if (user.xp >= nextLevelXp) {
      user.level += 1;
      user.xp -= nextLevelXp;
    }

    await user.save();
  }
}
