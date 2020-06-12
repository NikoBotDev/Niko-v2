import { Command, Argument } from 'discord-akairo';
import { Message, MessageAttachment } from 'discord.js';
import { stringify } from 'querystring';
import axios from 'axios';

export default class OsuProfileCommand extends Command {
  constructor() {
    super('osu-profile', {
      aliases: ['osu-profile', 'osup'],
      category: 'search',
      description: {
        content: 'Show a picture with information about a user.',
        usage: '<username> [mode] [(-color|-c) hexCode]',
        examples: ['FlyingTuna standard -c #4286f4'],
      },
      args: [
        {
          id: 'username',
          type: Argument.validate('string', (_, username: string) => {
            return /\w+/.test(username);
          }),
          prompt: {
            start: 'What user you want to get profile information?',
            retry: 'The username cannot contain special characters!',
          },
        },
        {
          id: 'mode',
          prompt: {
            start:
              'What mode you want to get info for that user?\n (One of the following => standard, taiko, ctb or mania)',
          },
        },
        {
          id: 'color',
          type: 'hexCode',
          match: 'option',
          flag: ['-c', '-color'],
          prompt: {
            retry: 'The color must be a valid hex code eg: #4286f4!',
          },
          default: '#4286f4',
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { username, color, mode }: { [key: string]: string },
  ) {
    const query = stringify({
      colour: `hex${color.replace('#', '')}`,
      uname: username,
      mode: OsuProfileCommand.modeToNumber(mode),
      pp: 0,
      countryrank: '',
      flagstroke: '',
      darktriangles: '',
      avatarrounding: 50,
    });
    const response = await axios.get<Buffer>(
      `https://lemmmy.pw/osusig/sig.php?${query}`,
      {
        responseType: 'arraybuffer',
      },
    );
    const attachment = new MessageAttachment(response.data, 'profile.jpg');
    return message.channel.send(attachment);
  }

  public static modeToNumber(mode: string): number {
    switch (mode) {
      case 'std':
      case 'standard':
        return 0;

      case 'taiko':
        return 1;

      case 'ctb':
      case 'catchthebeat':
        return 2;

      case 'mania':
      case 'osu!mania':
        return 3;

      default:
        return 0;
    }
  }
}
