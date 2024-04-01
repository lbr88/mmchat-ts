
import { Bot } from './bot';


async function main() {
  const bot = Bot.getInstance()
  await bot.start()
  await bot.registerEventHandlers()
}

main();