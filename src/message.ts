import { BotSettings } from './settings';
import { Bot } from './bot';
export class Message {
  botsettings: BotSettings = BotSettings.getInstance();
  bot: Bot;
  seq: number;
  event: string;
  data: any;
  post: any;
  from_bot?: boolean;
  is_direct?: boolean;
  is_thread?: boolean;
  is_mention?: boolean;
  constructor(seq: number, data: any, event: string) {
    this.bot = Bot.getInstance(this.botsettings);
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
  private _enrichPost(data: any, post: any) {
    if (data.props && data.props.from_bot) {
      this.from_bot = data.props.from_bot === 'true';
    }
    this.is_direct = data.channel_type === 'D';
    this.is_thread = post.root_id !== '';
    this.is_mention = data.mentions && data.mentions.includes(this.bot.info.id) || this.is_direct;
    // if we are mentioned let us remove our name from the message
    if (this.is_mention) {
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
}