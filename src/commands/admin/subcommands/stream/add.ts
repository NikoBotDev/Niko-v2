import { MessageEmbed, Message, TextChannel } from 'discord.js';
import { Command, Argument } from 'discord-akairo';
import { QueryFailedError } from 'typeorm';
import { Stream } from '@entities/Stream';
import { api } from '~/util/twitch';

const tokens: ReplaceTokens = {
  '{everyone}': '@everyone',
  '{here}': '@here',
};

type ReplaceTokens = {
  [x: string]: string;
};

type TrackStreamAddCommandArgs = {
  username: string;
  channel: TextChannel;
  message?: string;
};

export default class TrackStreamAddCommand extends Command {
  constructor() {
    super('stream_add', {
      category: 'admin',
      clientPermissions: ['EMBED_LINKS'],
      userPermissions: ['MANAGE_GUILD'],
      description: {
        content: 'Start tracking streams for the given twitch user.',
        usage: '<username> <channel> [message]',
        examples: ['niko #streams Hey {everyone}, {user} is streaming!!!'],
      },
      ownerOnly: true,
      args: [
        {
          id: 'username',
          type: 'lowercase',
          prompt: {
            start: 'What user you want to be tracked?\n',
          },
        },
        {
          id: 'channel',
          type: 'channel',
          unordered: [1, 2],
          default: (msg: Message) => msg.channel,
        },
        {
          id: 'message',
          type: Argument.validate('string', (_, msg: string) => {
            return msg.length < 1000;
          }),
          match: 'phrase',
          unordered: [1, 2],
        },
      ],
    });
  }

  async exec(
    msg: Message,
    { username, channel, message }: TrackStreamAddCommandArgs,
  ) {
    if (!msg.guild) return null;

    try {
      await api.get('/users', {
        params: {
          username,
        },
      });

      await Stream.insert({
        username,
        channelId: channel.id,
        guildId: msg.guild.id,
        message: message
          ? TrackStreamAddCommand.replaceTokens(message, username)
          : '',
      });
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return msg.reply('This user is already being tracked in this channel.');
      }
    }
    const description = `\`${username}\` is now being tracked in ${channel}`;
    const embed = new MessageEmbed()
      .setColor(0x6500ad)
      .setDescription(description);
    return msg.channel.send(embed);
  }

  static replaceTokens(message: string, username: string) {
    return message.replace(
      /{everyone}|{here}|{user}/gi,
      (match: string) => tokens[match] || username,
    );
  }
}
