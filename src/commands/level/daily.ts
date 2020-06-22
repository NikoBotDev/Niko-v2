import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import {
  format,
  differenceInMilliseconds,
  addDays,
  addMinutes,
} from 'date-fns';

import { Profile } from '@entities/Profile';
import * as xp from '~/util/xp';

const day = 24 * 60 * 60 * 1000;
export default class DailyCommand extends Command {
  constructor() {
    super('daily', {
      aliases: ['daily'],
      category: 'level',
      clientPermissions: ['EMBED_LINKS'],
      description: {
        content: 'Get your daily reward!',
      },
    });
  }

  async exec(message: Message) {
    const user = await Profile.findOne({
      where: {
        userId: message.author.id,
      },
    });
    if (!user) {
      return message.reply(
        "Sorry, you don't have an account, type anything to make one",
      );
    }
    const diff = differenceInMilliseconds(
      new Date(user.daily),
      addDays(new Date(), 1), // Add 24h
    );

    // Temporary fix for timezone differences
    const date = addMinutes(diff, +new Date().getTimezoneOffset());

    if (date.getTime() < day) {
      const timeLasting = format(date, 'kk:mm:ss');
      return message.reply(
        `You already claimed your daily, wait **${timeLasting}** to get it again!`,
      );
    }
    const exp = xp.getXpRewardForLevel(user.level);
    user.xp += exp;
    user.coins += 100;
    user.daily = Date.now();
    await user.save();
    return message.reply(
      `⬆ You claimed your daily reward: +${exp} xp & +100 coins`,
    );
  }
}
