import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { Profile } from '@entities/Profile';
import { getConnection } from 'typeorm';
import { getRewards, toNextLevel } from '~/util/xp';

export default class MessageListener extends Listener {
  constructor() {
    super('message', {
      emitter: 'client',
      event: 'message',
    });
  }

  async exec(message: Message) {
    if (message.author.bot) return;

    const { xp, coins } = getRewards();

    const connection = getConnection();

    await connection.transaction(async entityManager => {
      const { generatedMaps } = await entityManager
        .getRepository(Profile)
        .createQueryBuilder()
        .insert()
        .values({
          userId: message.author.id,
        })
        .onConflict(
          `("userId") DO UPDATE SET xp = profiles.xp + ${xp}, coins = profiles.coins + ${coins}, "updatedAt" = CURRENT_TIMESTAMP`,
        )
        .returning('"userId", level, xp')
        .execute();

      const user = Profile.create(generatedMaps[0]);

      const nextLevelXp = toNextLevel(user.level, true) as number;
      if (user.xp >= nextLevelXp) {
        user.level += 1;
        user.xp -= nextLevelXp;
        await user.save();
      }
    });
  }
}
