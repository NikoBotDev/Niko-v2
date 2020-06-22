import { Command } from 'discord-akairo';
import { Message, GuildMember, MessageAttachment } from 'discord.js';
import { ObjectLiteral, getConnection } from 'typeorm';

import { Profile } from '@entities/Profile';

import * as profile from '~/util/profile';

export default class ProfileCommand extends Command {
  constructor() {
    super('profile', {
      aliases: ['profile'],
      category: 'level',
      cooldown: 20000,
      clientPermissions: ['EMBED_LINKS'],
      description: {
        content: '',
      },
      args: [
        {
          id: 'member',
          type: 'member',
          default: (msg: Message) => msg.member,
        },
      ],
    });
  }

  async exec(msg: Message, { member }: { member: GuildMember | null }) {
    if (!member) return null;

    const connection = getConnection();

    let user:
      | Profile
      | undefined
      | ObjectLiteral = await connection
      .getRepository(Profile)
      .createQueryBuilder()
      .where('userId = :id', { id: member.id })
      .getOne();

    if (!user) {
      const { generatedMaps } = await Profile.createQueryBuilder()
        .insert()
        .into('profiles', ['userId', 'createdAt', 'updatedAt', 'daily'])
        .values({
          userId: member.id,
        })
        .execute();
      [user] = generatedMaps;
    }
    user = {
      ...user,
      badges: JSON.parse(user.badges),
    };
    const image = await profile.getImageFor(user as Profile, member, msg);
    const attachment = new MessageAttachment(
      image,
      `${msg.author.id}_profile.png`,
    );
    return msg.channel.send(attachment);
  }
}
