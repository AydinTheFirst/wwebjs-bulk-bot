import { Controller, Get, Post, Body } from "@nestjs/common";
import { WpService } from "./wp.service";
import { SendMessageDto } from "./wp.dto";

@Controller("wp")
export class WpController {
  constructor(private readonly wpService: WpService) {}

  @Get("qr")
  getQr() {
    return this.wpService.getQr();
  }

  @Get("auth")
  getAuth() {
    return this.wpService.getClientAuth();
  }

  @Post("send")
  sendMessage(@Body() body: SendMessageDto) {
    return this.wpService.sendMessage(body);
  }

  @Post("logout")
  logout() {
    return this.wpService.logout();
  }
}
