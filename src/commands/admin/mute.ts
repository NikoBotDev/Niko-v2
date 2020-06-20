import { Command, Argument } from 'discord-akairo';
import {
  MessageEmbed,
  Message,
  GuildMember,
  Role,
  GuildChannelManager,
} from 'discord.js';
import ms from 'ms';
import formatDistance from 'date-fns/formatDistance';
import * as uuid from 'uuid';
import { Mute } from '@entities/Mute';

import colors from '~/config/colors';

type MuteCommandArguments = {
  member: GuildMember;
  time: string;
  reason?: string;
};

export default class MuteCommand extends Command {
  constructor() {
    super('mute', {
      aliases: ['mute'],
      category: 'admin',
      description: {
        content: 'Blocks a member from speaking in this server.',
        usage: '<member> [reason]',
        examples: ['@toxicmember he is toxic'],
      },
      ratelimit: 2,
      channel: 'guild',
      clientPermissions: ['KICK_MEMBERS', 'MANAGE_CHANNELS'],
      userPermissions: ['KICK_MEMBERS'],
      args: [
        {
          id: 'member',
          type: Argument.validate(
            'member',
            (_, _phrase, member: GuildMember) =>
              member.id !== member.guild.ownerID && member.kickable,
          ),
          prompt: {
            start: 'What member you want to mute?\n',
            retry: "I can't find or mute that user, maybe pick another one?",
          },
        },
        {
          id: 'time',
          prompt: {
            start: 'Until when the user will be muted?\n',
          },
        },
        {
          id: 'reason',
          type: Argument.validate(
            'string',
            (_, _phrase, reason: string) => reason.length <= 1200,
          ),
          match: 'rest',
        },
      ],
    });
  }

  async exec(msg: Message, { member, time, reason }: MuteCommandArguments) {
    if (!msg.guild) {
      return null;
    }

    const { guild } = msg;
    // Check if the user already is muted
    const isMuted = await Mute.findOne({
      where: {
        userId: member.id,
        guildId: guild.id,
      },
    });

    const muteRoleId = this.client.settings.get<string>(
      guild.id,
      'muteRoleId',
      '',
    );

    if (isMuted) {
      if (!muteRoleId) {
        // If the role id isn't set then destroy the record
        await isMuted.remove();
        return null;
      }
      if (!member.roles.cache.has(muteRoleId)) {
        /* If the id is set and the user doesn't have the role
                    add it to the member
                */
        await member.roles.add(muteRoleId, 'Still muted');
        return null;
      }
    }
    // Mute the user

    let muteRole = null;
    if (!muteRoleId) {
      muteRole = await this.getRoleOrCreate(msg);
      if (!muteRole) return null;
      // Assign the role as mute role for this server
      await this.client.settings.set(guild.id, 'muteRoleId', muteRole.id);
      // Loop through all the channels and change their permissions for Mute Role
      const { channels } = guild;
      await this.changePermissions(channels, muteRole.id);
    }
    // Now the role exists lets get it
    if (muteRole instanceof Role) {
      await member.roles.add(muteRole as Role, reason);
    } else {
      muteRole = guild.roles.cache.get(muteRoleId as string);
      await member.roles.add(muteRole as Role, reason);
    }
    // Parse the end time using ms
    const endDate = ms(time) + new Date().getTime();
    // Add the role to the muted member

    // Add mute to the database

    const mute = Mute.create({
      id: uuid.v4(),
      userId: member.id,
      modId: msg.member!.id,
      guildId: guild.id,
      endDate,
    });

    await mute.save();
    // Make reply embed
    const embed = new MessageEmbed()
      .setColor(colors.success)
      .setTitle('Action: Mute')
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(
        `🔇 The user **__${member.user.username}(${member.id})__** has been muted!`,
      )
      .addField('Reason', reason)
      .addField(
        'Duration',
        formatDistance(endDate, new Date(), {
          includeSeconds: true,
        }),
      )
      .setFooter(msg.author.tag, msg.author.displayAvatarURL());
    return msg.channel.send(embed);
  }

  private async getRoleOrCreate(msg: Message): Promise<Role | null> {
    const guild = msg.guild!;
    let muteRole = guild.roles.cache.find(
      role => role.name.toLowerCase() === 'muted',
    );
    if (muteRole) return muteRole;
    if (!guild.me || !guild.me.permissions.has('MANAGE_ROLES')) {
      msg.reply(
        `I can't make a mute role for this action,
                please do it yourself`,
      );
      return null;
    }
    muteRole = await guild.roles.create({
      data: {
        name: 'Muted',
        permissions: 0,
      },
      reason: 'Role needed for mute command',
    });
    if (!muteRole) {
      msg.reply(`Something went wrong while making the role, sorry...`);
    }
    return muteRole;
  }

  private async changePermissions(
    channels: GuildChannelManager,
    muteRoleId: string,
  ): Promise<void> {
    channels.cache.forEach(channel => {
      if (
        !channels.guild.me ||
        !channel.permissionsFor(channels.guild.me)?.has('MANAGE_CHANNELS')
      ) {
        return;
      }
      if (channel.type === 'text') {
        channel.overwritePermissions([
          {
            id: muteRoleId,
            deny: ['SEND_MESSAGES', 'ADD_REACTIONS'],
          },
        ]);
      } else if (channel.type === 'voice') {
        channel.overwritePermissions([
          {
            id: muteRoleId,
            deny: ['SPEAK', 'CONNECT'],
          },
        ]);
      }
    });
  }
}
