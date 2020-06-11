import { Command, Argument, PrefixSupplier } from 'discord-akairo';
import { Message, MessageEmbed, PermissionResolvable } from 'discord.js';
import { stripIndents, oneLine } from 'common-tags';
import { dirname } from 'path';

import colors from '~/config/colors';

export default class CommandListCommand extends Command {
  constructor() {
    super('commands', {
      aliases: ['commands', 'cmds'],
      category: 'help',
      description: {
        content: oneLine`Shows the command list, pass no args to see the
        list of available categories.`,
        usage: '[category]',
        examples: ['util', ''],
      },
      args: [
        {
          id: 'category',
          prompt: {
            start: async (message: Message) => {
              const embed = this.getGroupList();
              message.channel.send(
                'What group you want to see the commands in?',
                embed,
              );
            },
          },
          type: Argument.validate(
            'lowercase',
            (_, category) => category !== 'owner',
          ),
          default: '',
        },
      ],
    });
  }

  async exec(message: Message, { category }: { category: string }) {
    const { modules } = this.handler;
    const commands = modules.filter(mdl => {
      return (
        !dirname(mdl.filepath).includes('subcommands') &&
        this.isAllowed(mdl, category, message)
      );
    });

    const getPrefix = this.handler.prefix as PrefixSupplier;

    const embed = new MessageEmbed()
      .setColor(colors.bot)
      .setDescription('Command List')
      .addField(
        category,
        commands.map(mdl => `${getPrefix(message)}${mdl.id}`).join('\n'),
        true,
      )
      .setFooter('These are only the commands you are able to use.');

    return message.channel.send('', embed);
  }

  getGroupList() {
    const categories = this.handler.categories
      .filter(cat => cat.id !== 'owner')
      .map(cat => `[**${cat.id}**]`);

    const embed = new MessageEmbed()
      .setColor(colors.bot)
      .setTitle('Group List')
      .setDescription(stripIndents`${categories.join('\n')}`);
    return embed;
  }

  isAllowed(mdl: Command, category: string, message: Message) {
    if (
      mdl.ownerOnly ||
      (mdl.categoryID && mdl.categoryID !== category.toLowerCase())
    ) {
      return false;
    }
    if (mdl.channel === 'guild' && message.member) {
      if (
        mdl.userPermissions &&
        message.member.permissions.missing(
          mdl.userPermissions as PermissionResolvable[],
        ).length !== 0
      ) {
        return false;
      }
      return true;
    }
    return true;
  }
}
