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
  { coins, xp, level, userId, profile_bg, married }: Profile,
  member: GuildMember,
  msg: Message,
) {
  Canvas.registerFont(fontFile('Roboto.ttf'), { family: 'Roboto' });
  Canvas.registerFont(fontFile('NotoEmoji-Regular.ttf'), { family: 'Roboto' });
  Canvas.registerFont(fontFile('Roboto-Bold.ttf'), { family: 'RbtB' });
  const client = msg.client as Niko;
  const users = await rank.getAllUsers();
  // let guildRank = sortRows(client.levels.fetchEverything(), msg);
  // guildRank = guildRank.findIndex((row) => row.userId === user.id);
  const marryUser = married ? await client.users.fetch(married) : null;
  const marryName = marryUser ? shortName(marryUser.tag) : '';
  const calculated = exp.toNextLevel(level, true) as number;
  const globalRank = rank.getGlobalRank(users, userId);
  const canvas = new Canvas(520, 318);
  const barSize = Math.PI * 2 * Math.min(Math.max(0, xp / calculated || 1), 1);
  const bg = await fs.readFile(
    join(basePath, 'backgrounds', `${profile_bg}.png`),
  );
  const response = await axios.get<Buffer>(
    member.user.displayAvatarURL({ format: 'png', size: 1024 }),
    {
      responseType: 'arraybuffer',
    },
  );
  const generate = async () => {
    canvas
      .addImage(bg, 0, 0, 520, 318)
      .scale(1, 1)
      .setPatternQuality('bilinear')
      .setAntialiasing('subpixel')
      .setTextAlign('left')
      // Add XP Data
      .setTextFont('15px RbtB')
      .setColor('#FFFFFF')
      .addText(`${xp}/${calculated}`, 255, 155)
      // Add Level
      .setTextFont('30px RbtB')
      .setColor('#333333')
      .addText(String(level), 105, 205)
      // Add Rank Data
      .setTextFont('14px RbtB')
      .setColor('#707070')
      .addText(String(kFormatter(globalRank)), 140, 254)
      .addText('1', 140, 286)
      // Add Coins Amount
      .addText(String(kFormatter(coins, 2)), 369, 253)
      // Add married user tag
      .addText(marryName, 375, 283)
      .save()
      // Draw xp bar
      .translate(318 / 2, 318 / 2)
      .rotate((-1 / 2 + 0 / 180) * Math.PI)
      .beginPath()
      .arc(85, 100, 53, 0, barSize, false)
      .setStroke('#30bae7')
      .setLineCap('round')
      .setLineWidth(5)
      .stroke()
      // Draw the user avatar
      .restore()
      .beginPath()
      .arc(260, 75, 51, 0, Math.PI * 2, true)
      .closePath()
      .clip()
      .setShadowBlur(5)
      .setShadowColor('rgba(0, 0, 0, 0.2)')
      .addImage(response.data, 208, 23, 105, 105);
    return canvas.toBufferAsync();
  };
  const buffer = await generate();
  return buffer;
}

export { getImageFor, getGlobalRank };
