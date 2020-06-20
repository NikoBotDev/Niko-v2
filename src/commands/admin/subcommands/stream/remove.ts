import { MessageEmbed, Message, TextChannel } from 'discord.js';
import { Command } from 'discord-akairo';

import { Stream } from '@entities/Stream';

import colors from '~/config/colors';

type RemoveStreamCommandArgs = { username: string; channel: TextChannel };

export default class RemoveStreamCommand extends Command {
  constructor() {
    super('remove-stream', {
      aliases: ['remove-stream'],
      category: 'admin',
      clientPermissions: ['EMBED_LINKS'],
      userPermissions: ['MANAGE_GUILD'],
      description: {
        content: "Remove a user that's being tracked in the given channel.",
        usage: '<username> <channel>',
        examples: ['niko #streams'],
      },
      ownerOnly: true,
      args: [
        {
          id: 'username',
          type: 'lowercase',
          prompt: {
            start: 'What user you want to be removed from tracking?\n',
          },
        },
        {
          id: 'channel',
          type: 'channel',
          prompt: {
            start: (_: Message, { username }: { username: string }) =>
              `What channel you want to remove the tracking for \`${username}\`?\n`,
          },
        },
      ],
    });
  }

  async exec(message: Message, { username, channel }: RemoveStreamCommandArgs) {
    const destroyed = await Stream.delete({
      username,
      channelId: channel.id,
    });
    if (destroyed.affected === 1) {
      const embed = new MessageEmbed()
        .setColor(colors.success)
        .setDescription(
          `✅ \`${username}\` is no longer being tracked in ${channel}`,
        );
      return message.channel.send(embed);
    }
    return message.reply("This user isn't being tracked in this channel!");
  }
}
