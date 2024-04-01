import { Message } from './message';

// Step 1: Define constants for each event type
export const EventPosted = "posted";
export const EventReaction = "reaction";
export const EventTyping = "typing";
export const EventHello = "hello";

export const EventTypes = {
  POSTED: EventPosted,
  REACTION: EventReaction,
  IS_TYPING: EventTyping,
  HELLO: EventHello,
};

export type Events = typeof EventTypes[keyof typeof EventTypes];

export class EventHandlers {
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
    //console.debug("Handling Event:", msg.data, msg.post, "with handler:", this)
    console.debug("Handling Event:", msg.event, "with handler:", this)
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
    console.log("Loaded PostedEventHandler:", this)
  }

  async handleEvent(msg: Message) {
    //console.debug("before checks Posted Event:", msg.data, msg.post, "with handler:", this)
    // bail if the user_id is ourself
    //console.debug("Checking if user_id is ourself:", msg.post.user_id, msg.bot.info.user_id, msg.post.user_id === msg.bot.info.user_id)
    if (msg.post.user_id === msg.bot.info.user_id) return;
    // fail fast so we can check all the things
    //console.debug("Checking if need_mention:", this.need_mention, "and is_mention:", msg.is_mention, "and need_direct:", this.need_direct, "and is_direct:", msg.is_direct, "and need_thread:", this.need_thread, "and is_thread:", msg.is_thread, "and regex:", this.regex, "and regex.test:", this.regex?.test(msg.post.message))
    if (this.need_mention && !msg.is_mention) return;
    if (this.need_direct && !msg.is_direct) return;
    if (this.need_thread && !msg.is_thread) return;
    //TODO: implement users / admins
    //if (this.need_admin && !msg.data.sender_name === 'admin') return;
    if (this.regex && !this.regex.test(msg.post.message)) return;
    //console.log("After checks before running Event:", msg.data, msg.post, "with handler:", this)
    await super.handleEvent(msg);
  }
}

export class HelloEventHandler extends EventHandler {
  constructor(func: (msg: Message) => Promise<void>) {
    super(EventHello, func);
    console.log("Loaded HelloEventHandler:", this)
  }
}