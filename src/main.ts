
import express from 'express';
import { Bot } from './bot';
import path from 'path';


async function main() {
  // bot part
  const bot = Bot.getInstance()
  await bot.start()
  await bot.registerEventHandlers()

  // httpserver part
  const app = express();
  const port = 3000;
  app.get('/bot-info', (req, res) => {
    res.json(bot.info)
  })
  app.use(express.static('../public'))
  app.get('/', (req, res) => {
    res.sendFile("index.html", { root: path.join(__dirname, '../public') });
  })
  app.get('/bundle.js', (req, res) => {
    res.sendFile("bundle.js", { root: path.join(__dirname, '../public') });
  })
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
  });
}

main();