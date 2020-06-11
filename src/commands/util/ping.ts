import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class Ping extends Command {
  constructor() {
    super('ping', {
      aliases: ['ping'],
      category: 'util',
    });
  }

  async exec(message: Message) {
    const pingMsg = (await message.util!.send('Pinging~')) as Message;
    const latency = pingMsg.createdTimestamp - message.createdTimestamp;
    return message.util!.send([
      `**Gateway Ping~ ${latency}ms**`,
      `**API Ping~ ${Math.round(this.client.ws.ping)}ms**`,
    ]);
  }
}
