import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import * as wwebjs from "whatsapp-web.js";
import { SendMessageDto } from "./wp.dto";
import { getBrowserPath } from "@/lib/chromium";

@Injectable()
export class WpService implements OnModuleInit {
  latestQr: string;
  client: wwebjs.Client;
  ready: boolean;

  onModuleInit() {
    this.client = new wwebjs.Client({
      authStrategy: new wwebjs.LocalAuth(),
      puppeteer: {
        executablePath: getBrowserPath(),
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    this.client.on("qr", (qr) => {
      Logger.debug("QR RECEIVED", "WpService");
      this.latestQr = qr;
    });

    this.client.on("ready", () => {
      Logger.debug("Client is ready!", "WpService");
      this.ready = true;
    });

    this.client.initialize().catch(console.error);
  }

  getQr() {
    if (!this.latestQr) throw new BadRequestException("QR kodu bulunamadı!");

    return {
      value: this.latestQr,
    };
  }

  async logout() {
    await this.client.logout();
    this.ready = false;
    return { message: "Çıkış yapıldı." };
  }

  getClientAuth() {
    this.isReady();
    const auth = this.client.info;
    return auth;
  }

  isReady() {
    if (!this.ready) {
      throw new BadRequestException("Whatsapp bağlantısı henüz sağlanmadı!");
    }
  }

  async getChats() {
    this.isReady();
    const chats = await this.client.getChats();
    return chats;
  }

  async sendMessage({ message, users }: SendMessageDto) {
    this.isReady();

    const promise = users.map(async (user) => {
      const chatId = `${user.phone}@c.us`;
      const chat = await this.client.getChatById(chatId);
      const personalizedMessage = message
        .replace(/{name}/g, user.firstName)
        .replace(/{surname}/g, user.lastName)
        .replace(/{phone}/g, user.phone);
      return chat.sendMessage(personalizedMessage);
    });

    const result = await Promise.allSettled(promise);

    return { message: "Mesajlar gönderildi.", result };
  }
}
