import { Command, Argument } from 'discord-akairo';
import { Message } from 'discord.js';
import { join } from 'path';
import { findOrMake } from '~/util/profile';

export default class CoinFlipCommand extends Command {
  constructor() {
    super('coin-flip', {
      aliases: ['coin-flip', 'cf'],
      category: 'games',
      clientPermissions: ['EMBED_LINKS', 'ATTACH_FILES'],
      description: {
        content: 'Test your luck and flip a coin!',
      },
      args: [
        {
          id: 'bet',
          type: Argument.range('integer', 100, 1000),
          prompt: {
            start: 'What is your bet? (max 1000)',
          },
        },
        {
          id: 'choice',
          type: Argument.validate('lowercase', (_m, _p, choice) =>
            ['head', 'tail'].includes(choice),
          ),
          prompt: {
            start: 'Which one you wanna choose? (head or tail)',
          },
        },
      ],
    });
  }

  async exec(
    msg: Message,
    { bet, choice }: { bet: number; choice: 'head' | 'tail' },
  ) {
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

    const head = Math.floor(Math.random() * 2) === 1;
    let side: string;
    if (head) {
      side = 'head';
    } else {
      side = 'tail';
    }

    const coin = join(__dirname, '..', '..', 'assets', 'coins', `${side}.png`);

    const options = {
      files: [{ attachment: coin, name: 'coinflip.png' }],
    };

    if (side === choice) {
      row.coins += bet + 10;
      msg.channel.send('games.coin-flip.win', options);
    } else {
      msg.channel.send('games.default.betterLuck', options);
    }

    await row.save();
    return null;
  }
}
