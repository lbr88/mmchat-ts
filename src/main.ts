
import { PostedEventHandler } from './events';
import { BotSettings } from './settings';
import { Bot } from './bot';


// create the bot
async function main() {
  // get settings
  const settings = BotSettings.getInstance();
  const bot = Bot.getInstance(settings);
  await bot.start();

  // Define a command
  bot.events.on(new PostedEventHandler(async (msg) => {
    console.log('Hello command received');
    bot.replyToPost(msg.post, 'Hello! ' + msg.data.sender_name);
  }, {
    regex: /hello/i,
    need_mention: true
  }));

}

main();