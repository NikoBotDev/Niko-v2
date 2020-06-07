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

export default class EvalCommand extends Command {
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
      script
    );
    if (!embed) return;
    const color =
      message.member && message.member.roles.highest.color !== 0
        ? message.member.roles.highest.color
        : colors.bot;
    embed.setColor(color);
    return msg.util!.send('', embed);
  }

  async makeResultMessages(result: any, hrDiff: number[], input: string) {
    const inspected = inspect(result, { depth: 0 })
      .replace(nlPattern, '\n')
      .replace(this.sensitivePattern!, fakeToken);
    if (inspected.length > 1500) {
      console.log(inspected);
      return;
    }
    const data = await axios.get('https://nekos.life/api/neko', {
      responseType: 'json',
    });
    const embed = new MessageEmbed()
      .setTitle('Evaluated JS')
      .setThumbnail(data ? data.neko : '')
      .setFooter(`Type: ${typeof result}`);
    if (inspected.length >= 1500) {
      const a = await axios.post('https://pastebin.com/api/api_post.php', {
        data: this.createFormData(inspected),
      });
      embed.setDescription(
        `:inbox_tray: Input\n\`\`\`javascript\n${input}\n\`\`\`\n:outbox_tray: Output ${
          hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''
        }${
          hrDiff[1] / 1000000
        }ms.\n\`\`\`javascript\nOutput is too long and was uploaded to pastebin: ${
          a ? await a.text() : '[Fail]'
        }\n\`\`\``
      );
    } else {
      embed.setDescription(
        `:inbox_tray: Input\n\`\`\`javascript\n${input}\n\`\`\`\n:outbox_tray: Output ${
          hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''
        }${hrDiff[1] / 1000000}ms.\n\`\`\`javascript\n${inspected}\n\`\`\``
      );
    }
    return embed;
  }

  get sensitivePattern() {
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
