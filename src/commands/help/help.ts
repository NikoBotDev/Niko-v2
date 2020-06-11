import { Command, Argument, PrefixSupplier } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { stringify } from 'querystring';

import colors from '~/config/colors';

export default class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: ['help', 'h'],
      category: 'help',
      description: {
        content:
          'Displays a list of available commands, or detailed information for a specified command.',
        usage: '[command]',
      },
      ratelimit: 2,
      clientPermissions: ['EMBED_LINKS'],
      args: [
        {
          id: 'command',
          description: 'Command to get info about',
          type: Argument.union('command', 'commandAlias'),
          prompt: {
            optional: true,
          },
        },
      ],
    });
  }

  exec(message: Message, { command }: { command?: Command }) {
    const getPrefix = this.handler.prefix as PrefixSupplier;
    const prefix = getPrefix(message);
    if (!command) {
      const query = stringify({
        client_id: this.client.user!.id,
        permissions: 379904,
        scope: 'bot',
      });
      const url = `https://discordapp.com/oauth2/authorize?${query}`;
      const embed = new MessageEmbed()
        .setColor(colors.success)
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setDescription(
          `Hello ${message.author.username}, i'm ${
            this.client.user!.username
          } here is some links that might help you, check them below!\nIf you have any questions or want to report a bug, please enter in the [Support Server](https://www.google.com.br/) you'll be very welcome in there! If you want to add me in your server click in the link below! ${url}\n`,
        )
        .setFooter(
          this.client.user!.username,
          this.client.user!.displayAvatarURL(),
        );
      return message.channel.send(embed);
    }

    const embed = new MessageEmbed()
      .setColor(colors.bot)
      .setTitle(
        `\`${command.aliases[0]} ${
          command.description.usage ? command.description.usage : ''
        }\``,
      )
      .addField('Description', command.description.content || '\u200b');

    if (command.aliases.length > 1)
      embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true);
    if (command.description.examples && command.description.examples.length)
      embed.addField(
        'Examples',
        `\`${prefix + command.aliases[0]} ${command.description.examples.join(
          `\`\n\`${prefix + command.aliases[0]} `,
        )}\``,
        true,
      );

    return message.util!.send(embed);
  }
}
