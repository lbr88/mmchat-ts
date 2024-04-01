import { Message } from './message';

// Step 1: Define constants for each event type
export const EventPosted = "posted";
export const EventReaction = "reaction";
export const EventTyping = "typing";
export const EventHello = "hello";

// Step 2: Optionally, group constants into an object
export const EventTypes = {
  POSTED: EventPosted,
  REACTION: EventReaction,
  IS_TYPING: EventTyping,
  HELLO: EventHello,
};

// Step 3: Define a type that is a union of the constant values
export type Events = typeof EventTypes[keyof typeof EventTypes];

export class EventHandlers {
  // Initialize with lowercase keys to match the actual event constants.
  eventhandlers: { [key in Events]: EventHandler[] } = {
    posted: [],
    reaction: [],
    typing: [],
    hello: [],
  };

  on(command: EventHandler) {
    this.eventhandlers[command.event].push(command);
  }

  async handleEvent(msg: Message) {
    // Assuming msg.event is correctly typed as Events.
    const handlers = this.eventhandlers[msg.event];
    if (!handlers) return;

    for (const command of handlers) {
      await command.handleEvent(msg);
    };
  }
}

export abstract class EventHandler {
  public readonly event: Events;
  func: (msg: Message) => Promise<void>;

  constructor(event: Events, func: (msg: Message) => Promise<void>) {
    this.event = event;
    this.func = func;
  }

  async handleEvent(msg: Message) {
    await this.func(msg);
  }
}

interface PostedEventHandlerInterface {
  regex?: RegExp;
  need_mention?: boolean;
  need_direct?: boolean;
  need_thread?: boolean;
  need_admin?: boolean;
}

export class PostedEventHandler extends EventHandler implements PostedEventHandlerInterface {
  regex?: RegExp;
  need_mention?: boolean;
  need_direct?: boolean;
  need_thread?: boolean;
  need_admin?: boolean;

  constructor(func: (msg: Message) => Promise<void>, options?: PostedEventHandlerInterface) {
    super(EventPosted, func);
    this.regex = options?.regex;
    this.need_mention = options?.need_mention;
    this.need_direct = options?.need_direct;
    this.need_thread = options?.need_thread;
    this.need_admin = options?.need_admin;
    // if all options are undefined, throw an error
    if (!this.regex && !this.need_mention && !this.need_direct && !this.need_thread && !this.need_admin) {
      throw new Error('PostedEventHandler must have at least one option');
    }
  }

  async handleEvent(msg: Message) {
    // bail if the user_id is ourself
    if (msg.post.user_id === msg.bot.info.user_id) return;
    console.log("eventhandler:", this)
    console.log("msg.data:", msg.data)
    console.log("msg.post:", msg.post)
    // fail fast so we can check all the things
    if (this.need_mention && !msg.is_mention) return;
    if (this.need_direct && !msg.is_direct) return;
    if (this.need_thread && !msg.is_thread) return;
    //TODO: implement users / admins
    //if (this.need_admin && !msg.data.sender_name === 'admin') return;
    if (this.regex && !this.regex.test(msg.post.message)) return;
    await this.func(msg);
  }
}

export class HelloEventHandler extends EventHandler {
  constructor(func: (msg: Message) => Promise<void>) {
    super(EventHello, func);
  }
}