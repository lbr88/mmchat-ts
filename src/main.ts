import dotenv from 'dotenv';

import { WebSocketClient } from '@mattermost/client';
import WebSocket from 'ws';
import { Client4 } from '@mattermost/client';
import { Message } from './message';
import { PostedEvent, EventHandlers, EventType, HelloEvent } from './events';
import { Post } from '@mattermost/types/lib/posts';

if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket as any;
}

function createPartialPost(overrides: Partial<Post> = {}): Post {
  // why did i choose to use typescript. gawd this is terrible
  const record: Record<string, any> = {
    "a": 1,
    "b": 2,
  }
  const post: Post = {
    id: "",
    create_at: 1234,
    update_at: 1234,
    edit_at: 0,
    delete_at: 0,
    is_pinned: false,
    user_id: "me",
    channel_id: "",
    root_id: "",
    original_id: "",
    message: "",
    type: "",
    props: record,
    metadata: {
      embeds: [],
      emojis: [],
      files: [],
      images: {},
      reactions: [],
    },
    hashtags: "abd",
    pending_post_id: "abd",
    reply_count: 0,
    ...overrides,
  }
  return post;
}

class Bot {
  wsClient: WebSocketClient;
  mmClient: Client4;
  events: EventHandlers;
  wspath: string;
  settings: { host: string, token: string };
  info: any;
  constructor(settings: { host: string, token: string }) {
    this.settings = settings;
    this.wsClient = new WebSocketClient();
    this.mmClient = new Client4();
    this.events = new EventHandlers();
    this.wspath = '/api/v4/websocket';
  }
  setupClients() {
    this.mmClient.setUrl(this.settings.host);
    this.mmClient.setToken(this.settings.token);
  }
  connectClients() {
    this.wsClient.initialize(this.settings.host + this.wspath, this.settings.token);
  }
  setupListeners() {
    this.wsClient.addMessageListener(async (msg) => {
      // pass through all messages to the event handler
      const msgobj = new Message(msg.seq, msg.data, msg.event);
      console.log(msgobj);

      this.events.handleEvent(msgobj);
    });

    this.addEventListener(EventType.HELLO, new HelloEvent(async (msg) => {
      console.log('Hello event received lets get some info about our self');
      // get some info about our self
      this.mmClient.getUser("me").then((user) => {
        this.updateSelfInfo(user);
      }, (err) => {
        console.error(err);
      });

    }));


  }
  addEventListener(event: EventType, handler: HelloEvent | PostedEvent) {
    this.events.on(event, handler);
  }
  replyToPost(post: Post, message: string) {
    const reply: Post = createPartialPost({
      channel_id: post.channel_id,
      message: message,
      root_id: post.id,
    });
    this.mmClient.createPost(reply).then((post) => {
      console.log('Reply posted', post);
    }, (err) => {
      console.error('Error posting reply', err);
    });
  }
  updateSelfInfo(info: any) {
    this.info = info;
  }
  async convertUserIdToUsername(id: string) {
    await this.mmClient.getUser(id).then((user) => {
      return user.username;
    });
  }
  async start() {
    this.setupClients();
    this.connectClients();
    this.setupListeners();
  }
}



// create the bot
async function main() {
  // get settings
  dotenv.config();
  if (!process.env.MM_URL || !process.env.MM_BOT_TOKEN) {
    console.error('Please set MM_URL and MM_BOT_TOKEN in your environment');
    process.exit(1);
  }
  const settings = {
    host: process.env.MM_URL,
    token: process.env.MM_BOT_TOKEN,
  }
  const bot = new Bot(settings);
  await bot.start();

  // Define a command
  bot.addEventListener(EventType.POSTED, new PostedEvent(/hello/, async (msg) => {
    console.log('Hello command received');
    bot.replyToPost(msg.post, 'Hello! ' + msg.data.sender_name);
  }));

}

main();