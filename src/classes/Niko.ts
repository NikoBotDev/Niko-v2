import {
  AkairoClient,
  CommandHandler,
  ListenerHandler,
  InhibitorHandler,
} from 'discord-akairo';
import path from 'path';
import * as Sentry from '@sentry/node';

import { Setting } from '@entities/Setting';
import TypeORMProvider from '~/database/providers/TypeORMProvider';
import sentryConfig from '~/config/sentry';

import hexCode from './argumentTypes/hexCode';

const { TOKEN, NODE_ENV } = process.env;

class Niko extends AkairoClient {
  public readonly commandHandler: CommandHandler;

  public readonly listenerHandler: ListenerHandler;

  public readonly inhibitorHandler: InhibitorHandler;

  public readonly settings: TypeORMProvider;

  constructor() {
    super({
      ownerID: '272070510341259264',
      disableMentions: 'everyone',
    });

    this.commandHandler = new CommandHandler(this, {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      prefix: _ => {
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

    this.settings = new TypeORMProvider(Setting, {
      idColumn: 'guild_id',
      dataColumn: 'settings',
    });

    if (NODE_ENV !== 'development') {
      Sentry.init(sentryConfig);
    }
  }

  async start() {
    this.commandHandler.loadAll();

    this.commandHandler.useListenerHandler(this.listenerHandler);

    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler,
    });

    this.listenerHandler.loadAll();

    this.inhibitorHandler.loadAll();

    this.registerCustomTypes();

    await this.settings.init();

    await this.login(TOKEN);

    console.log('Logged in successfully!!!');
  }

  private registerCustomTypes() {
    this.commandHandler.resolver.addType('hexCode', hexCode);
  }
}

export default Niko;
