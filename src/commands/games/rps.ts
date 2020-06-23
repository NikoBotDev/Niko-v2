import { Command, Argument } from 'discord-akairo';
import { Message } from 'discord.js';

export default class RPSGameCommand extends Command {
  constructor() {
    super('rps', {
      aliases: ['rps', 'rocketpapercissor'],
      category: 'games',
      clientPermissions: ['EMBED_LINKS'],
      description: {
        content: 'Play Rocket Paper Scissor game with me!',
      },
      args: [
        {
          id: 'bet',
          type: Argument.validate('string', (_, choice) => {
            return this.isValidResponse(choice);
          }),
          prompt: {
            start: 'What is your choice? (rock, paper or scissors)?',
          },
        },
      ],
    });
  }

  async exec(message: Message, { choice }: { choice: string }) {
    const pick = this.getChoice(choice);
    let text;
    const nikoPick = Math.floor(Math.random() * 2);
    if (pick === nikoPick) {
      text = `It is a draw, both picked ${this.getRpsPick(pick)}`;
    } else if (
      (pick === 0 && nikoPick === 1) ||
      (pick === 1 && nikoPick === 2) ||
      (pick === 2 && nikoPick === 0)
    ) {
      text = `You lose! ${this.getRpsPick(nikoPick)} | ${this.getRpsPick(
        pick,
      )}`;
    } else {
      text = `You win! ${this.getRpsPick(pick)} | ${this.getRpsPick(nikoPick)}`;
    }
    return message.channel.send(text);
  }

  getRpsPick(pick: number) {
    switch (pick) {
      case 0:
        return '🚀';
      case 1:
        return '📎';
      default:
        return '✂️';
    }
  }

  isValidResponse(pick: string) {
    return this.choices.includes(pick);
  }

  get choices() {
    return [
      'r',
      'pedra',
      'rock',
      'rocket',
      'p',
      'papel',
      'paper',
      'paperclip',
      's',
      'tesoura',
      'scissors',
    ];
  }

  getChoice(choice: string) {
    switch (choice) {
      case 'r':
      case 'pedra':
      case 'rock':
      case 'rocket':
        return 0;
      case 'p':
      case 'papel':
      case 'paper':
      case 'paperclip':
        return 1;
      case 'scissors':
      case 'tesoura':
      case 's':
        return 2;
      default:
        return 0;
    }
  }
}
