import { PostedEventHandler } from "../events";
import { Message } from "../message";
import { Bot } from "../bot";

export default function register(bot: Bot) {
  bot.events.on(new PostedEventHandler(async (msg: Message) => {
    console.log('Hello command received');
    bot.replyToPost(msg.post, 'Hello! ' + msg.data.sender_name);
  }, {
    regex: /hello/i,
    need_mention: true
  }));
}
