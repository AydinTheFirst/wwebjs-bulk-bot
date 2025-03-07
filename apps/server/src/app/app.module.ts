import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

// Import all routes from the API_ROUTES object
import { AppRoutes } from "./routes";
import { ServeStaticModule } from "@nestjs/serve-static";
import path from "path";
import fs from "fs";

const routes = Object.values(AppRoutes);

const clientPath = () => {
  const publicPath = path.join(process.cwd(), "public");
  if (fs.existsSync(publicPath)) return publicPath;

  throw new Error("Client path not found!");
};

@Module({
  imports: [
    ...routes,
    ServeStaticModule.forRoot({
      rootPath: clientPath(),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
