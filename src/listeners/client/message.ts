import { Listener } from 'discord-akairo';

export default class MessageListener extends Listener {
  constructor() {
    super('message', {
      emitter: 'client',
      event: 'message',
    });
  }

  exec() {
    console.log('Message received');
  }
}
