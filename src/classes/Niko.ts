import {
  AkairoClient,
  CommandHandler,
  ListenerHandler,
  InhibitorHandler,
} from 'discord-akairo';
import path from 'path';
import * as Sentry from '@sentry/node';

import sentryConfig from '~/config/sentry';

const { TOKEN, NODE_ENV } = process.env;

class Niko extends AkairoClient {
  public commandHandler: CommandHandler;
  public listenerHandler: ListenerHandler;
  public inhibitorHandler: InhibitorHandler;
  constructor() {
    super({
      ownerID: '272070510341259264',
      disableMentions: 'everyone',
    });

    this.commandHandler = new CommandHandler(this, {
      prefix: (message) => {
        return '<';
      },
      commandUtil: true,
      defaultCooldown: 2e3,
      directory: path.resolve(__dirname, '..', 'commands'),
    });

    this.listenerHandler = new ListenerHandler(this, {
      directory: path.resolve(__dirname, '..', 'listeners'),
    });

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: path.resolve(__dirname, '..', 'inhibitors'),
    });

    if (NODE_ENV !== 'development') {
      Sentry.init(sentryConfig);
    }
  }

  async start() {
    this.commandHandler.loadAll();

    this.commandHandler.useListenerHandler(this.listenerHandler);

    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);

    this.listenerHandler.loadAll();

    this.inhibitorHandler.loadAll();

    await this.login(TOKEN);

    console.log('Logged in successfully!!!');
  }
}

export default Niko;
