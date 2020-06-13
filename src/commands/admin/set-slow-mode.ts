import { Command, Argument } from 'discord-akairo';
import { oneLine } from 'common-tags';
import { TextChannel, Message } from 'discord.js';

export default class SetSlowModeCommand extends Command {
  constructor() {
    super('set-slow-mode', {
      aliases: ['set-slow-mode', 'ssmd'],
      category: 'admin',
      description: {
        content: oneLine`Add or change the rate limit settings for this channel.^
                If you want to disable just type \`0\` for seconds.`,
        usage: '<seconds> [reason]',
        examples: ['30 People was spamming a lot lol', "0 they're good again"],
      },
      clientPermissions: ['MANAGE_CHANNELS'],
      userPermissions: ['MANAGE_CHANNELS'],
      args: [
        {
          id: 'seconds',
          type: Argument.range('integer', 0, 120),
          prompt: {
            start:
              'What is the amount of seconds that users will be limited to?\n',
            retry:
              "That isn't a valid amount, please type a number in the range 0-120\n",
          },
        },
        {
          id: 'reason',
          type: Argument.validate(
            'string',
            (_, reason) => reason.length <= 1200,
          ),
          match: 'rest',
          default: 'No reason given',
        },
      ],
    });
  }

  async exec(
    msg: Message,
    { seconds, reason }: { seconds: number; reason: string },
  ) {
    const msgChannel = msg.channel as TextChannel;
    await msgChannel.setRateLimitPerUser(seconds, reason);
    return msg.reply(
      `The new interval between messages for this channel is **${seconds}** sec(s)!`,
    );
  }
}
