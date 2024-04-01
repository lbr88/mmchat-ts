import { Message } from './message';
export enum EventType {
  "POSTED" = "posted",
  "REACTION" = "reaction",
  "IS_TYPING" = "typing",
  "HELLO" = "hello",
}
export class EventHandlers {
  eventhandlers: { [key: string]: Array<HelloEvent | PostedEvent> };
  constructor() {
    this.eventhandlers = {};
  }
  on(event: EventType, command: PostedEvent | HelloEvent) {
    if (!this.eventhandlers[event]) {
      this.eventhandlers[event] = [];
    }
    this.eventhandlers[event].push(command);
  }

  async handleEvent(msg: Message) {
    const event = msg.event;
    // check if we have any listeners for this event type
    if (!this.eventhandlers[event]) {
      return;
    }
    if (event === EventType.HELLO) {
      this.eventhandlers[event].forEach(async (command) => {
        await command.handleEvent(msg);
      });
      return;
    } else if (event === EventType.POSTED) {
      this.eventhandlers[event].forEach(async (command) => {
        console.log('Checking command', command.regex, msg.post.message);
        if (command.regex.test(msg.post.message)) {
          await command.handleEvent(msg);
        }
      });
    }
  }
}

export class Event {
  event: string;
  func: (msg: any) => Promise<void>;
  constructor(event: string, func: (msg: any) => Promise<void>) {
    this.event = event;
    this.func = func;
  }
  async checkEvent(msg: any) {
    if (!this.func) {
      throw new Error('No function defined for command');
    }
    if (!msg) {
      throw new Error('No message passed to command');
    }
  }
  async handleEvent(msg: any) {
    this.checkEvent(msg);
    await this.func(msg);
  }
}

export class PostedEvent extends Event {
  regex: RegExp;
  constructor(regex: RegExp, func: (msg: any) => Promise<void>) {
    super(EventType.POSTED, func);
    this.regex = regex;
  }
  async handleEvent(msg: any) {
    super.checkEvent(msg);
    console.log('Command received', msg.post.message)
    if (this.regex.test(msg.post.message)) {
      await this.func(msg);
    }
  }
}

export class HelloEvent extends Event {
  regex: RegExp;
  constructor(func: (msg: any) => Promise<void>) {
    super(EventType.HELLO, func);
    this.regex = /notused/;
  }
  async handleEvent(msg: any) {
    super.checkEvent(msg);
    await this.func(msg);
  }
}