import { Command, Argument } from 'discord-akairo';
import { Message } from 'discord.js';
import { findOrMake } from '~/util/profile';
import WheelOfFortune from '~/classes/games/WheelOfFortune';

export default class WheelOfFortuneCommand extends Command {
  constructor() {
    super('wheel', {
      aliases: ['wheel'],
      category: 'games',
      clientPermissions: ['EMBED_LINKS'],
      description: {
        content: 'Test your luck with the awesomest Wheel Of Fortune!',
      },
      args: [
        {
          id: 'bet',
          type: Argument.range('integer', 100, 5000),
          prompt: {
            start: 'What is your bet?',
          },
        },
      ],
    });
  }

  async exec(msg: Message, { bet }: { bet: number }) {
    const row = await findOrMake({
      userId: msg.author.id,
    });

    if (!row) {
      return null;
    }

    if (bet > row.coins) {
      return msg.channel.send('games.default.notEnough');
    }

    row.coins -= bet;
    const wof = new WheelOfFortune();
    const { multipliers } = wof;
    const amount = bet * wof.multiplier;

    if (amount >= 1) {
      row.coins += Math.round(amount);

      msg.channel.send(`**${msg.author.tag} won: ${`${Math.round(amount)}$`}
      『${multipliers[1]}』   『${multipliers[0]}』   『${multipliers[7]}』
   『${multipliers[2]}』      ${wof.emoji}      『${multipliers[6]}』
        『${multipliers[3]}』   『${multipliers[4]}』   『${
        multipliers[5]
      }』**`);
    } else {
      msg.channel.send('You did not won any coins...');
    }

    await row.save();
    return null;
  }
}
