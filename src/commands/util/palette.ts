import { Command } from 'discord-akairo';
import { Message, MessageAttachment } from 'discord.js';
import axios from 'axios';
import { Canvas } from 'canvas-constructor';

type RGB = [number, number, number];
interface ColorMindResponse {
  result: RGB[];
}

export default class PaletteCommand extends Command {
  constructor() {
    super('palette', {
      aliases: ['palette', 'ptt'],
      category: 'util',
      cooldown: 6000,
      description: {
        content: 'Send a random beautiful palette',
      },
      ratelimit: 2,
    });
  }

  public async exec(message: Message) {
    try {
      const response = await axios.post<ColorMindResponse>(
        'http://colormind.io/api/',
        {
          model: 'default',
        },
      );
      const colors = response.data.result;
      const buffer = await this.genPalette(colors);
      const attachment = new MessageAttachment(buffer, 'palette.png');
      message.channel.send(message.author, attachment);
    } catch (error) {
      console.error(error);
    }
  }

  async genPalette(colors: RGB[]) {
    const canvas = new Canvas(800, 160);
    let nextPos = 0;
    colors.forEach(rgb => {
      const [red, green, blue] = rgb;
      canvas.setColor(`rgb(${red}, ${green}, ${blue})`);
      canvas.addRect(nextPos, 0, 160, 160);
      nextPos += 160;
    });
    return canvas.toBufferAsync();
  }
}
