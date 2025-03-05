import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

// Import all routes from the API_ROUTES object
import { AppRoutes } from "./routes";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

const routes = Object.values(AppRoutes);

@Module({
  imports: [
    ...routes,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "..", "client", "dist"),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
