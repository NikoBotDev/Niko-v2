import { Command } from 'discord-akairo';
import { Message, MessageEmbed, Emoji } from 'discord.js';
import format from 'date-fns/format';

import colors from '~/config/colors';

export default class ServerInfoCommand extends Command {
  constructor() {
    super('server-info', {
      aliases: ['server-info', 'sinfo'],
      category: 'util',
      description: {
        content: 'Fetch server information and send it in a fashion way.',
      },
      channel: 'guild',
      ratelimit: 2,
    });
  }

  public exec(message: Message) {
    const guild = message.guild;

    if (!guild) {
      return;
    }

    const { channels } = guild;
    const textChannels = channels.cache.filter((ch) =>
      /text|store|news/.test(ch.type)
    );
    const voiceChannels = channels.cache.filter((ch) => ch.type === 'voice');
    const createdAt = format(guild.createdAt, 'MM-dd-yyyy HH:mm:ss');
    const emojis = guild.emojis.cache.map(this.formatEmoji);
    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setAuthor(guild.name)
      .setImage(guild.iconURL() || '')
      .addField('ID', guild.id, true)
      .addField('Owner', guild.owner?.user.tag ?? 'Unavailable', true)
      .addField('Members', guild.memberCount, true)
      .addField('Text Channels', textChannels.size, true)
      .addField('Voice Channels', voiceChannels.size, true)
      .addField('Created At', createdAt, true)
      .addField('Region', guild.region, true)
      .addField('Roles', guild.roles.cache.size - 1, true)
      .addField('Features', guild.features.join(', ') || '-', true)
      .addField(
        `Emojis(${emojis.length})`,
        emojis.length ? emojis.splice(0, 10).join(' ') : '-',
        true
      );
    message.util!.send(embed);
  }

  formatEmoji(emoji: Emoji) {
    return `\`${emoji.name}\` <${emoji.animated ? 'a' : ''}:${emoji.name}:${
      emoji.id
    }>`;
  }
}
