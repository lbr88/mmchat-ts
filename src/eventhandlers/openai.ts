
import { PostedEventHandler } from "../events";
import { Message } from "../message";
import { Bot } from "../bot";
import dotenv from 'dotenv';
import OpenAI from 'openai';

type Settings = {
  apiKey: string | undefined;
};
function loadSettings(): Settings {
  dotenv.config();
  return {
    apiKey: process.env.OPENAI_API_KEY
  };
}
export default function register(bot: Bot) {
  const settings = loadSettings()
  if (!settings.apiKey) {
    // fail gracefully if the API key is not set
    console.warn('OpenAI API key not set, skipping OpenAI event handler');
    return;
  }
  const openai = new OpenAI(settings);
  bot.events.on(new PostedEventHandler(async (msg: Message) => {
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: msg.post.message },
      ]
    };
    const response: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);
    await bot.replyToPost(msg.post, response.choices[0].message.content);
  }, {
    need_mention: true
  }));
}