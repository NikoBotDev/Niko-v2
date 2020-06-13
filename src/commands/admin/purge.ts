import { Command, Argument, PrefixSupplier } from 'discord-akairo';
import { Message, MessageEmbed, GuildMember } from 'discord.js';
import { oneLine } from 'common-tags';

import colors from '~/config/colors';

interface IPurgeCommandArgs {
  amount: number;
  type: string | GuildMember;
  filterPinned: boolean;
}
type FilterFunc = (m: Message) => boolean;

export default class PurgeCommand extends Command {
  constructor() {
    super('purge', {
      aliases: ['purge'],
      category: 'admin',
      description: {
        content: oneLine`Purge x amount of messages you can use the following types:
                me, command, bot, all or member mention and you can add the -fp flag to filter
                pinned (hyper important) messages from the channel.`,
        usage: '<amount> [type] [-fp flag]',
        examples: ['10 me|command|bot|all|@member [-fp]', '10 me -fp'],
      },
      ratelimit: 2,
      channel: 'guild',
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES'],
      args: [
        {
          id: 'amount',
          type: Argument.range('integer', 5, 100),
          prompt: {
            start: 'How many messages you want to be deleted?\n',
            retry: "This isn't a valid amount, the range must be 5 ~ 100",
          },
        },
        {
          id: 'type',
          type: Argument.union('lowercase', 'memberMention'),
          default: 'all',
        },
        {
          id: 'filterPinned',
          match: 'flag',
          flag: ['-fp', '-filterpinned'],
        },
      ],
    });
  }

  public async exec(
    msg: Message,
    { amount, type, filterPinned }: IPurgeCommandArgs,
  ) {
    let messages = await msg.channel.messages.fetch({ limit: amount + 1 });
    let filter: FilterFunc | null = null;
    const getPrefix: PrefixSupplier = this.handler.prefix as PrefixSupplier;
    if (filterPinned) {
      messages = messages.filter(m => !m.pinned);
    }
    switch (type) {
      case 'me':
        filter = m => m.author.id === msg.author.id;
        break;
      case 'command':
        filter = m => m.content.startsWith(getPrefix(msg) as string);
        break;
      case 'bot':
        filter = m => m.author.bot;
        break;
      case 'all':
        filter = null;
        break;
      default:
        filter = m => m.author.id === msg.mentions.members?.first()?.id;
    }
    messages = filter ? messages.filter(filter) : messages;
    await msg.channel.bulkDelete(messages, true);
    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setDescription(
        `Successfully removed **${messages.size}** messages from this channel.`,
      )
      .setFooter('This message will be removed in 5 seconds.');
    const res = await msg.channel.send(embed);
    if (res.deletable) {
      return res.delete({ timeout: 5e3 });
    }
    return null;
  }
}
