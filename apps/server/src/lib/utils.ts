import { Logger } from "@nestjs/common";
import os from "os";
import path from "path";
import fs from "fs";

export const getChromiumPath = () => {
  const defaultLinuxPath = "/snap/bin/chromium";
  if (fs.existsSync(defaultLinuxPath)) return defaultLinuxPath;

  const pathname = path.join(process.cwd(), "chromium");

  switch (os.platform()) {
    case "win32":
      return path.join(pathname, "win", "chrome.exe");
    case "linux":
      return path.join(pathname, "linux", "chrome");
    case "darwin":
      return path.join(
        pathname,
        "mac",
        "Chromium.app",
        "Contents",
        "MacOS",
        "Chromium"
      );
    default:
      throw new Error("Unsupported OS");
  }
};

Logger.debug("Chromium path: " + getChromiumPath(), "Utils");
