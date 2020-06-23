import { Message, Collection } from 'discord.js';
import { Profile } from '@entities/Profile';

type GuildRankingRow = {
  [x: string]: {
    level: number;
    xp: number;
  };
};

/**
 * Get user rank based on their index
 */
function getGlobalRank(rows: Profile[], userId: string) {
  return rows.findIndex(row => row.userId === userId) + 1;
}

/**
 * Get user rank based on their index
 */
function sortRows(rows: Collection<string, GuildRankingRow>, msg: Message) {
  const filtered = rows.filter(row => !!row![msg.guild!.id]);
  if (filtered.size === 0) return null;
  return filtered
    .map(row => row![msg.guild!.id])
    .sort((a, b) => b.level - a.level || b.xp - a.xp);
}

/**
 * Get all users from database
 */
async function getAllUsers() {
  const profiles = await Profile.find({
    select: [
      'userId',
      'xp',
      'level',
      'coins',
      'married',
      'profile_bg',
      'badges',
    ],
    order: {
      level: 'DESC',
      xp: 'DESC',
    },
  });
  return profiles;
}

export { getGlobalRank, sortRows, getAllUsers };
