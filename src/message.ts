import { Bot } from './bot';
import { Post } from '@mattermost/types/lib/posts';
export class Message {
  bot: Bot;
  seq: number;
  event: string;
  data: any;
  post: any;
  from_bot?: boolean;
  is_direct?: boolean;
  is_thread?: boolean;
  is_mention?: boolean;
  root_post?: Post;
  constructor(seq: number, data: any, event: string) {
    this.bot = Bot.getInstance();
    this.seq = seq;
    this.event = event;
    this.data = data;
    if (this.data.post) {
      this.post = this._getPost();
      if (this.event == 'posted' && this.post) {
        this._enrichPost(data, this.post);
      }
    }
  }
  private async _enrichPost(data: any, post: any) {
    if (data.props && data.props.from_bot) {
      this.from_bot = data.props.from_bot === 'true';
    }
    this.is_direct = data.channel_type === 'D';
    if (this.is_direct) {
      // if it is a direct message, we are always mentioned
      this.is_mention = true;
    }
    this.is_thread = post.root_id !== '';
    if (this.is_thread) {
      // TODO: use this to figure out if we are mentioned in the root post
      // Currently it does not pass data when calling getPost so it is not possible (maybe cache the root post in the bot class?)
      try {
        await this.bot.mmClient.getPost(post.root_id).then((root_post) => {
          this.root_post = root_post;
        });
      } catch (e) {
        console.error('Error fetching root post', e);
      }
    }
    this.is_mention = data.mentions && data.mentions.includes(this.bot.info.id) || this.is_direct;
    // if we are mentioned let us remove our name from the message
    if (this.is_mention || this.is_direct) {
      this.post.message = post.message.replace(new RegExp(`@${this.bot.info.username}`, 'ig'), '').trim();
      this.post.message = post.message.replace(new RegExp(`@${this.bot.info.first_name}`, 'ig'), '').trim();
    }
  }
  private _getPost() {
    if (!this.data.post) {
      return null;
    }
    try {
      const jsonPost = JSON.parse(this.data.post);
      return jsonPost
    } catch (e) {
      console.error('Error parsing post', e);
      return null;
    }
  }
  public static createPartialPost(overrides: Partial<Post> = {}): Post {
    // why did i choose to use typescript. gawd this is terrible
    // hack because mattermost types suck and doesn't account for create api endpoints
    // https://github.com/mattermost/mattermost/issues/26319
    const record: Record<string, any> = {
      "from_bot": true,
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
}