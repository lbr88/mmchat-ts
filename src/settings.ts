import dotenv from 'dotenv';

export class BotSettings {
  private static instance: BotSettings;
  host: string;
  token: string;
  debug: boolean = false;
  private constructor() {
    dotenv.config();
    if (!process.env.MM_URL || !process.env.MM_BOT_TOKEN) {
      console.error('Please set MM_URL and MM_BOT_TOKEN in your environment');
      process.exit(1);
    }
    this.host = process.env.MM_URL;
    this.token = process.env.MM_BOT_TOKEN;
    this.debug = process.env.DEBUG === 'true';
  }
  public static getInstance() {
    if (!BotSettings.instance) {
      BotSettings.instance = new BotSettings();
    }
    return new BotSettings();
  }
}