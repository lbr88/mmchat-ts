
import { PostedEventHandler } from './events';
import { Bot } from './bot';


// create the bot
async function main() {
  // get settings
  const bot = Bot.getInstance();
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