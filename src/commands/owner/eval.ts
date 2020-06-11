/* eslint-disable no-underscore-dangle */
import { inspect } from 'util';
import { Message, MessageEmbed } from 'discord.js';
import escapeRegex from 'escape-string-regexp';
import { Command } from 'discord-akairo';
import axios from 'axios';
import FormData from 'form-data';

import colors from '~/config/colors';

import Niko from '~/classes/Niko';

const fakeToken = 'MzEy0u3zHAr3uDuyNaA3Dr3t.4rd3d;.bruAw9wvn--E8UQWT5aEN8dyYZ0';
const nlr = '!!NL!!';
const nlPattern = new RegExp(nlr, 'g');

interface NekoAPIResponse {
  neko: string;
}

export default class EvalCommand extends Command {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private lastResult?: any;

  private _sensitivePattern?: RegExp;

  constructor() {
    super('eval', {
      aliases: ['eval', 'e'],
      ownerOnly: true,
      category: 'owner',
      description: {
        content: 'Allow execution of javascript code',
        usage: '[code]',
      },
      args: [
        {
          id: 'script',
          match: 'content',
          prompt: {
            start: 'What code would you like to evaluate?\n',
          },
          description: 'code to evaluate',
        },
      ],
    });
  }

  async exec(msg: Message, { script }: { script: string }) {
    script = script.replace('exit', 'process.exit(0)');
    const message = msg;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const client = msg.client as Niko;
    let hrDiff;
    try {
      const hrStart = process.hrtime();
      this.lastResult = eval(script);

      if (this.lastResult instanceof Promise) {
        this.lastResult = await this.lastResult;
      }

      hrDiff = process.hrtime(hrStart);
    } catch (err) {
      return msg.util!.reply(`Error while evaluating: \`${err}\``);
    }

    const embed = await this.makeResultMessages(
      this.lastResult,
      hrDiff,
      script,
    );
    if (!embed) return null;
    const color =
      message.member && message.member.roles.highest.color !== 0
        ? message.member.roles.highest.color
        : colors.bot;
    embed.setColor(color);
    return msg.util!.send('', embed);
  }

  async makeResultMessages(result: unknown, hrDiff: number[], input: string) {
    const inspected = inspect(result, { depth: 0 })
      .replace(nlPattern, '\n')
      .replace(this.sensitivePattern as RegExp, fakeToken);
    if (inspected.length > 1500) {
      console.log(inspected);
      return null;
    }
    let nekoImg = '';
    try {
      const response = await axios.get<NekoAPIResponse>(
        'https://nekos.life/api/neko',
      );

      nekoImg = response.data.neko;
    } catch (error) {
      // ignored
    }

    const embed = new MessageEmbed()
      .setTitle('Evaluated JS')
      .setThumbnail(nekoImg)
      .setFooter(`Type: ${typeof result}`);
    if (inspected.length >= 1500) {
      try {
        const ptbRes = await axios.post(
          'https://pastebin.com/api/api_post.php',
          this.createFormData(inspected),
          {
            responseType: 'text',
          },
        );
        embed.setDescription(
          `:inbox_tray: Input\n\`\`\`javascript\n${input}\n\`\`\`\n:outbox_tray: Output ${
            hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''
          }${
            hrDiff[1] / 1000000
          }ms.\n\`\`\`javascript\nOutput is too long and was uploaded to pastebin: ${
            ptbRes.data
          }\n\`\`\``,
        );
      } catch (error) {
        // ignored
      }
    } else {
      embed.setDescription(
        `:inbox_tray: Input\n\`\`\`javascript\n${input}\n\`\`\`\n:outbox_tray: Output ${
          hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''
        }${hrDiff[1] / 1000000}ms.\n\`\`\`javascript\n${inspected}\n\`\`\``,
      );
    }
    return embed;
  }

  get sensitivePattern(): RegExp | void {
    if (!this._sensitivePattern) {
      const { client } = this;
      let pattern = '';
      if (client.token) pattern += escapeRegex(client.token);
      Object.defineProperty(this, '_sensitivePattern', {
        value: new RegExp(pattern, 'gi'),
      });
    }
    return this._sensitivePattern;
  }

  createFormData(code: string) {
    const form = new FormData();
    form.append('api_option', 'paste');
    form.append('api_dev_key', process.env.PASTEBIN_KEY!);
    form.append('api_paste_private', '1');
    form.append('api_paste_name', 'eval_result');
    form.append('api_paste_format', 'javascript');
    form.append('api_paste_code', code);
    return form;
  }
}
