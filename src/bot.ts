import { WebSocketClient } from '@mattermost/client';
import WebSocket from 'ws';
import { Client4 } from '@mattermost/client';
import { Message } from './message';
import { EventHandlers, HelloEventHandler } from './events';
import { Post } from '@mattermost/types/lib/posts';
import { BotSettings } from './settings';
import { readdir } from 'fs/promises';
import { join } from 'path';

if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket as any;
}

export class Bot {
  private static instance: Bot;
  wsClient: WebSocketClient = new WebSocketClient();
  mmClient: Client4 = new Client4();
  events: EventHandlers = new EventHandlers();
  wspath = '/api/v4/websocket';
  settings: BotSettings;
  info: any;

  private constructor() {
    this.settings = BotSettings.getInstance();
  }
  public static getInstance() {
    if (!Bot.instance) {
      Bot.instance = new Bot();
    }
    return Bot.instance;
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
      if (this.settings.debug) {
        console.debug("data:", msgobj.data);
        console.debug("data.post:", msgobj.post);
      }
      this.events.handleEvent(msgobj);
    });

    this.events.on(new HelloEventHandler(async (msg) => {
      this.mmClient.getUser("me").then((user) => {
        this.updateSelfInfo(user);
      });
    }));
  }


  async replyToPost(post: Post, message?: string | null) {
    const reply_id = post.root_id || post.id;
    const reply: Post = Message.createPartialPost({
      channel_id: post.channel_id,
      message: message || '',
      root_id: reply_id,
    });
    try {
      await this.mmClient.createPost(reply);
    } catch (e) {
      console.error('Error replying to post', e);
    }
  }

  private updateSelfInfo(info: any) {
    this.info = info;
    this.info.user_id = info.id;
  }

  async convertUserIdToUsername(id: string) {
    await this.mmClient.getUser(id).then((user) => {
      return user.username;
    });
  }
  async registerEventHandlers() {
    const handlersDir = join(__dirname, 'eventhandlers');
    const files = await readdir(handlersDir);

    for (const file of files) {
      if (file.endsWith('.ts')) {
        const modulePath = join(handlersDir, file);
        const registerHandler = await import(modulePath);
        registerHandler.default(this);
      }
    }
  }

  async start() {
    this.setupClients();
    this.connectClients();
    this.setupListeners();
  }
}
