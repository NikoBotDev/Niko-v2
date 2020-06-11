import {
  Command,
  Argument
} from 'discord-akairo';
import { Message } from 'discord.js';
import { oneLine } from 'common-tags';

type TagActionType = 'add' | 'remove' | 'info' | 'update';

export default class TagCommand extends Command {
  constructor() {
    super('tag', {
      aliases: ['tag'],
      category: 'admin',
      description: {
        content: 'Add remove, update or see infos about a tag',
        usage: '<add|remove|update|info> <name> [content](Only add and update)',
        examples: [
          'add hello Hi, i am a bot',
          'remove hello',
          'info hello',
          'update hello Hi, i am a cool bot'
        ]
      },
      args: [
        {
          id: 'type',
          type: Argument.validate('lowercase', (_, type) => {
            return ['add', 'remove', 'info', 'update'].includes(type);
          }),
          prompt: {
            start: oneLine`You want to \`update\` \`remove\` or \`add\` a tag?
                        You can use \`info\` to see informations about a tag\n`
          }
        },
        {
          id: 'args',
          match: 'rest',
          prompt: {
            start: (_: Message, { phrase: type }: { phrase: string; }) => {
              const str = 'Alright, please type in a name';
              if (['update', 'add'].includes(type)) {
                return `${str} and content\n`;
              }
              return str;
            }
          }
        }
      ]
    });
  }

  async exec(message: Message, { type, args }: { type: TagActionType; args: string; }) {
    const command = this.handler.modules.get(
      {
        add: 'tag-add',
        remove: 'tag-remove',
        info: 'tag-info',
        update: 'tag-update'
      }[type]
    );
    return this.handler.handleDirectCommand(message, args, command!);
  }
}
