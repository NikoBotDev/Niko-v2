import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { exec } from 'child_process';

export default class ExecuteCommand extends Command {
  constructor() {
    super('exec', {
      aliases: ['exec', 'sudo'],
      category: 'owner',
      ownerOnly: true,
      description: {
        content: 'Allow execution of bash code',
        usage: '[code]',
      },
      args: [
        {
          id: 'script',
          type: 'string',
          match: 'content',
          prompt: {
            start: 'What script you want to be executed?\n',
          },
        },
      ],
    });
  }

  async exec(message: Message, { script }: { script: string }) {
    try {
      const result = await this.executeScript(script);
      return message.channel.send(
        `➡ Input: \`\`\`${script}\`\`\` \n✅ Output:\n\`\`\`${result}\`\`\``
      );
    } catch (err) {
      return message.channel.send(
        `➡ Input: \`\`\`${script}\`\`\` \n❌ Output:\n\`\`\`${err}\`\`\``
      );
    }
  }

  executeScript(code: string) {
    return new Promise((resolve, reject) => {
      exec(code, (error, stdout, stderr) => {
        if (error) reject(`error: ${error}\n\n${stderr}`);
        resolve(stdout);
      });
    });
  }
}
