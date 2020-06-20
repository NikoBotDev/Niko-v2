import { Message } from 'discord.js';
import { Command, Argument } from 'discord-akairo';
import { oneLine } from 'common-tags';

type TrackStreamActionType = 'add' | 'remove' | 'list';

export default class TrackStreamCommand extends Command {
  constructor() {
    super('track-stream', {
      aliases: ['track-stream', 'tstrm'],
      category: 'admin',
      clientPermissions: ['EMBED_LINKS'],
      userPermissions: ['MANAGE_GUILD'],
      ownerOnly: true,
      description: {
        content: oneLine`Add or remove a stream from tracking and lists all the
                streams that are being tracked in this channel`,
        usage: '<add|remove|list> *args*]',
        examples: [
          'add niko #streams Hey {everyone}, {user} is streaming!!!',
          'remove niko #streams',
          'list',
        ],
      },
      args: [
        {
          id: 'type',
          type: Argument.validate('lowercase', (_, type) => {
            return ['add', 'remove', 'list'].includes(type);
          }),
          prompt: {
            start: oneLine`You want to \`remove\` or \`add\` a user?
                        You can also use \`list\` to list all the users being tracked in this channel.`,
          },
        },
        {
          id: 'args',
          match: 'rest',
          prompt: {
            start: (_: Message, { type }: { type: TrackStreamActionType }) => {
              if (type === 'add') {
                return 'Please type a user, channel and a optional message for tracking';
              }
              return 'Please type a user and channel that you want to remove the tracking';
            },
            optional: true,
          },
          default: '',
        },
      ],
    });
  }

  async exec(
    msg: Message,
    { type, args }: { type: TrackStreamActionType; args: string },
  ) {
    const command = this.handler.modules.get(
      {
        add: 'stream_add',
        remove: 'streamRemove',
        list: 'list_streams',
      }[type],
    );
    return this.handler.handleDirectCommand(msg, args, command!);
  }
}
