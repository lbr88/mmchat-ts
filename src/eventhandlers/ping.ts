import { PostedEventHandler } from "../events";
import { Message } from "../message";
import { Bot } from "../bot";

export default function register(bot: Bot) {
  bot.events.on(new PostedEventHandler(async (msg: Message) => {
    await bot.replyToPost(msg.post, 'pong');
  }, {
    regex: /ping/i,
    need_mention: true
  }));
}