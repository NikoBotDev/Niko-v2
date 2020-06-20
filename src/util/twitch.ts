import axios, { AxiosError } from 'axios';
import { MessageEmbed } from 'discord.js';

import colors from '~/config/colors';

const { TWITCH_KEY } = process.env;
const api = axios.create({
  baseURL: 'https://api.twitch.tv/helix',
  headers: {
    'CLIENT-ID': TWITCH_KEY,
  },
});

type WidthHeightReplaceParams = {
  url: string;
  width: number;
  height: number;
};

interface ITwitchStreamData {
  title: string;
  viewer_count: number;
  started_at: string;
  thumbnail_url: string;
}

interface ITwitchGameData {
  name: string;
}

interface ITwitchUserData {
  login: string;
  display_name: string;
  profile_image_url: string;
}

function handleRequestErrors(error: AxiosError) {
  const is404 = error.response?.status === 404;

  if (is404) {
    return;
  }
  throw error;
}

async function getStreamData(username: string) {
  try {
    const res = await api.get(`/streams`, {
      params: {
        user_login: username,
      },
    });
    if (res.status !== 200) return null;
    return res.data.data[0];
  } catch (err) {
    handleRequestErrors(err);
    return null;
  }
}

async function getUserData(username: string) {
  try {
    const res = await api.get(`/users`, {
      params: {
        username,
      },
    });
    return res.data;
  } catch (err) {
    handleRequestErrors(err);
    return null;
  }
}

function putWidthAndHeightInUrl({
  url,
  width,
  height,
}: WidthHeightReplaceParams) {
  return url
    .replace('{width}', String(width))
    .replace('{height}', String(height));
}

function getAlertEmbed(
  data: ITwitchStreamData,
  userData: ITwitchUserData,
  gameData: ITwitchGameData,
) {
  const {
    title,
    viewer_count: views,
    thumbnail_url: preview,
    started_at: startedAt,
  } = data;
  const {
    display_name: displayName,
    login,
    profile_image_url: profileImg,
  } = userData;
  const game = gameData.name;
  const url = `https://twitch.tv/${login}`;
  const embed = new MessageEmbed()
    .setColor(0x802bff)
    .setTitle(displayName)
    .setDescription(`[${title || 'No title'}](${url})`)
    .setThumbnail(
      profileImg ||
        'https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png',
    )
    .setImage(
      putWidthAndHeightInUrl({ url: preview, width: 1920, height: 1080 }),
    )
    .addField('Game', game || 'Games & Demos')
    // .addField('Followers', followers, true)
    .addField('Views', views, true)
    .setTimestamp(new Date(startedAt));
  return embed;
}

function getOfflineEmbed(username: string) {
  return new MessageEmbed()
    .setColor(colors.error)
    .setAuthor(username, `https://twitch.tv/${username}`)
    .setDescription(`\`${username}\` ended the stream.`)
    .setTimestamp();
}

async function getGameData(gameId: string) {
  try {
    const res = await api.get(`/games`, {
      params: {
        id: gameId,
      },
    });
    return res.data;
  } catch (err) {
    if (err.response.statusCode === 404) return null;
    throw err;
  }
}

// https://static-cdn.jtvnw.net/previews-ttv/live_user_alanzoka-{width}x{height}.jpg

export {
  getUserData,
  getGameData,
  getAlertEmbed,
  getStreamData,
  getOfflineEmbed,
  api,
};
