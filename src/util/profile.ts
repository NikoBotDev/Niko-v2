import { Message, GuildMember } from 'discord.js';
import { Canvas } from 'canvas-constructor';
import { promises as fs } from 'fs';
import { join } from 'path';
import axios from 'axios';

import { Profile } from '@entities/Profile';
import Niko from '~/classes/Niko';

import * as exp from '~/util/xp';
import * as rank from '~/util/rank';

const basePath = join(process.cwd(), 'src', 'assets');

function shortName(entireTag: string) {
  if (entireTag.length > 7) {
    return `${entireTag.substring(0, 7)}...`;
  }
  return entireTag;
}

function getGlobalRank(users: Profile[], userId: string) {
  const globalRank = users.findIndex(user => user.userId === userId);
  if (globalRank === -1) return 'Unknown';
  return globalRank;
}

/**
 * Format numbers in K format
 * @reference https://goo.gl/5iqP8v
 * @example 2500 = 2.5k
 */
function kFormatter(num: number, decimals = 1) {
  return num > 999 ? `${(num / 1000).toFixed(decimals)}k` : num;
}

function fontFile(name: string): string {
  return join(basePath, 'fonts', name);
}

async function getImageFor(
  { coins, xp, level, userId, profile_bg, married, badges }: Profile,
  member: GuildMember,
  msg: Message,
) {
  Canvas.registerFont(fontFile('Raleway-SemiBold.ttf'), { family: 'Raleway' });
  Canvas.registerFont(fontFile('NotoEmoji-Regular.ttf'), {
    family: 'Raleway',
  });
  Canvas.registerFont(fontFile('FontAwesome.ttf'), {
    family: 'Raleway',
  });
  Canvas.registerFont(fontFile('arial.ttf'), {
    family: 'Raleway',
  });
  Canvas.registerFont(fontFile('FontAwesome.ttf'), {
    family: 'Font Awesome',
  });
  const client = msg.client as Niko;
  const users = await rank.getAllUsers();
  // let guildRank = sortRows(client.levels.fetchEverything(), msg);
  // guildRank = guildRank.findIndex((row) => row.userId === user.id);
  const marryUser = married ? await client.users.fetch(married) : null;
  const marryName = marryUser ? shortName(marryUser.tag) : '';
  const calculated = exp.toNextLevel(level, true) as number;
  const globalRank = rank.getGlobalRank(users, userId);
  const canvas = new Canvas(336, 504);
  const barSize = Math.min(
    298 * Math.min(Math.max(0, xp / calculated || 1), 1) + 49,
    298,
  );
  const bg = await fs.readFile(
    join(basePath, 'backgrounds', `${profile_bg}.png`),
  );
  let spacing = 0;
  const response = await axios.get<Buffer>(
    member.user.displayAvatarURL({ format: 'png', size: 1024 }),
    {
      responseType: 'arraybuffer',
    },
  );
  const generate = async () => {
    canvas
      .addImage(bg, 0, 0, canvas.width, canvas.height)
      .scale(1, 1)
      .setPatternQuality('bilinear')
      .setAntialiasing('subpixel')
      .setTextAlign('left')
      // Add XP Data
      .setTextFont('15px "Raleway"')
      .setColor('#FFFFFF')
      .addText(`${xp}/${calculated}`, canvas.width / 2 - 20, 256)
      // Add Level
      .setTextFont('23px "Raleway"')
      .setColor('#ffffff')
      .addText(String(level), canvas.width / 2 - 5, 220)
      // Add Rank Data
      .setTextFont('18px "Raleway"')
      .setColor('#fff')
      .addText(String(kFormatter(globalRank)), 78, 324)
      // Add Coins Amount
      .setTextFont('18px "Raleway"')
      .addText(String(kFormatter(coins, 2)), 79, 385)
      // Add married user tag
      .setTextFont('15px "Raleway"')
      .addText(marryName, 76, 443)
      .setShadowColor('white')
      .setShadowBlur(8)
      .setTextFont('17px "Font Awesome"');

    badges.forEach(badge => {
      const initial = badges.length * 26;
      canvas.addText(badge, canvas.width - initial + spacing, 30);
      spacing += 25;
    });
    canvas
      .setShadowBlur(0)
      .save()
      // Draw xp bar
      .beginPath()
      .moveTo(49, 267)
      .lineTo(barSize, 267)
      .setStroke('#30bae7')
      .setLineCap('round')
      .setLineWidth(9)
      .stroke()
      .restore()
      .beginPath()
      .moveTo(49, 267)
      .arc(barSize, 267, 8, 0, Math.PI * 2, true)
      .closePath()
      .setStroke('#fff')
      .fill()
      .restore()
      // Draw the user avatar
      .beginPath()
      .arc(168, 123, 51, 0, Math.PI * 2, true)
      .closePath()
      .clip()
      .setShadowBlur(5)
      .setShadowColor('rgba(0, 0, 0, 0.2)')
      .addImage(response.data, 116, 71, 105, 105)
      .restore();

    return canvas.toBufferAsync();
  };
  const buffer = await generate();
  return buffer;
}

async function findOrMake(whereOption: { userId: string }) {
  try {
    const user = await Profile.findOne({
      where: whereOption,
    });
    if (!user) {
      const { generatedMaps } = await Profile.insert({
        ...whereOption,
      });
      return Profile.create(generatedMaps[0]);
    }

    return user;
  } catch (error) {
    return null;
  }
}
export { getImageFor, getGlobalRank, findOrMake };
