import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import fs from "fs";

// Import all routes from the API_ROUTES object
import { AppRoutes } from "./routes";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

const routes = Object.values(AppRoutes);

const clientPath = () => {
  const path = join(process.cwd(), "..", "client", "dist");
  if (fs.existsSync(path)) return path;

  return join(process.cwd(), "public");
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
