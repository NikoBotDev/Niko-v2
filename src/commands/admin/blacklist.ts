import { Message } from 'discord.js';
import { Command, Argument } from 'discord-akairo';

type BlacklistActionType = 'add' | 'remove';

export default class BlacklistCommand extends Command {
  constructor() {
    super('blacklist', {
      aliases: ['blacklist', 'bckl'],
      category: 'admin',
      clientPermissions: ['EMBED_LINKS'],
      userPermissions: ['MANAGE_GUILD'],
      description: {
        content: 'Add or remove a user from server blacklist',
        usage: '<add|remove> <user>',
        examples: ['add @user', 'remove @user'],
      },
      args: [
        {
          id: 'type',
          type: Argument.validate('lowercase', (_, type) => {
            return ['add', 'remove'].includes(type);
          }),
          prompt: {
            start: 'You want to `remove` or `add` a user?',
          },
        },
        {
          id: 'args',
          match: 'rest',
          prompt: {
            start: 'What user you want to be blacklisted?',
          },
        },
      ],
    });
  }

  async exec(
    message: Message,
    { type, args }: { type: BlacklistActionType; args: string },
  ) {
    const command = this.handler.modules.get(
      {
        add: 'blacklist-add',
        remove: 'blacklist-remove',
      }[type],
    );
    return this.handler.handleDirectCommand(message, args, command!);
  }
}
