import { MessageEmbed, Message } from 'discord.js';
import { Command } from 'discord-akairo';

import { Stream } from '@entities/Stream';

import colors from '~/config/colors';

export default class ListStreamsCommand extends Command {
  constructor() {
    super('list_streams', {
      aliases: ['list_streams'],
      category: 'admin',
      clientPermissions: ['EMBED_LINKS'],
      ownerOnly: true,
      description: {
        content: 'List all streams that are being tracked in this channel.',
      },
    });
  }

  async exec(message: Message) {
    console.log({
      guildId: message.guild?.id ?? '0',
      channelId: message.channel.id,
    });
    const trackedStreams = await Stream.find({
      where: {
        channelId: message.channel.id,
        guildId: message.guild?.id ?? '0',
      },
    });
    if (trackedStreams.length === 0) {
      return message.reply('No one is being tracked in this channel!');
    }
    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setDescription(
        `Streams being tracked in this channel\n
                ${trackedStreams.map(stream => `\`${stream.username}\`, `)}`,
      )
      .setFooter('Stream Tracker', this.client.user?.avatarURL() ?? undefined);
    return message.channel.send(embed);
  }
}
