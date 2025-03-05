import { Module } from "@nestjs/common";
import { WpService } from "./wp.service";
import { WpController } from "./wp.controller";

@Module({
  controllers: [WpController],
  providers: [WpService],
})
export class WpModule {}
