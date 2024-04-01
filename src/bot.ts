import { WebSocketClient } from '@mattermost/client';
import WebSocket from 'ws';
import { Client4 } from '@mattermost/client';
import { Message } from './message';
import { EventHandlers, HelloEventHandler } from './events';
import { Post } from '@mattermost/types/lib/posts';
import { BotSettings } from './settings';

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
      if (BotSettings.getInstance().debug) {
        console.debug("data:", msgobj.data);
        console.debug("data.post:", msgobj.post);
      }
      this.events.handleEvent(msgobj);
    });

    this.events.on(new HelloEventHandler(async (msg) => {
      console.log('Hello event received lets get some info about our self');
      // get some info about our self
      this.mmClient.getUser("me").then((user) => {
        this.updateSelfInfo(user);
      }, (err) => {
        console.error(err);
      });
    }));
  }
  createPartialPost(overrides: Partial<Post> = {}): Post {
    // why did i choose to use typescript. gawd this is terrible
    const record: Record<string, any> = {
      "from_bot": this.info.is_bot,
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
      hashtags: "",
      pending_post_id: "",
      reply_count: 0,
      ...overrides,
    }
    return post;
  }

  replyToPost(post: Post, message: string) {
    const reply: Post = this.createPartialPost({
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

  private updateSelfInfo(info: any) {
    this.info = info;
    this.info.user_id = info.id;
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
