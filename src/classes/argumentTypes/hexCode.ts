import { Message } from 'discord.js';

export default (_: Message, phrase: string) => {
  if (!phrase) return null;
  if (/^#[0-9a-f]{6}$/i.test(phrase)) return phrase.replace('#', '');
  return null;
};
