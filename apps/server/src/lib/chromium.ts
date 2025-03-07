import { Logger } from "@nestjs/common";
import path from "path";
import {
  Browser,
  detectBrowserPlatform,
  getInstalledBrowsers,
  resolveBuildId,
  install,
} from "@puppeteer/browsers";
import os from "os";
import fs from "fs";

export function getBrowserPath() {
  let browserPath = "";
  switch (os.platform()) {
    case "win32":
      browserPath =
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
      break;
    case "linux":
      browserPath = "/usr/bin/google-chrome";
      break;
    case "darwin":
      browserPath =
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
      break;
    default:
      Logger.error("Platform belirlenemedi.", "Browser");
      process.exit(1);
  }

  if (!fs.existsSync(browserPath)) {
    Logger.error(
      `Tarayıcı bulunamadı. Lütfen tarayıcının yüklü olduğundan emin olun. (${browserPath})`,
      "Browser"
    );
    process.exit(1);
  }

  Logger.debug(`Tarayıcı yolu: ${browserPath}`, "Browser");

  return browserPath;
}

export async function getChromiumPath() {
  const downloadsFolder = path.join(process.cwd(), ".chromium");
  const browserPlatform = detectBrowserPlatform();

  if (!browserPlatform) {
    Logger.error("Platform belirlenemedi.", "Chromium");
    process.exit(1);
  }

  const installedBrowsers = await getInstalledBrowsers({
    cacheDir: downloadsFolder,
  });

  // Chromium zaten yüklü ise, yüklü olanı kullan
  if (installedBrowsers.length > 0) {
    Logger.debug(
      "Yüklü Chromium bulundu. Yüklü olan kullanılacak.",
      "Chromium"
    );

    return installedBrowsers[0].executablePath;
  }

  Logger.debug(
    `Chromium indiriliyor... (Platform: ${browserPlatform})`,
    "Chromium"
  );

  // Güncel Chromium build ID'sini al
  const buildId = await resolveBuildId(
    Browser.CHROME,
    browserPlatform,
    "latest"
  );

  let lastProgress = -1; // İlerleme oranını tutacak değişken
  const chromiumPath = await install({
    browser: Browser.CHROME,
    platform: browserPlatform,
    buildId,
    cacheDir: downloadsFolder,
    downloadProgressCallback(downloadedBytes, totalBytes) {
      const progress = Math.round((downloadedBytes / totalBytes) * 100);

      // Sadece ilerleme %10'luk dilimlere geldiğinde yazdırma yap
      if (progress % 10 === 0 && progress !== lastProgress) {
        Logger.debug(`Chromium indiriliyor... %${progress}`, "Chromium");
        lastProgress = progress; // Son ilerleme oranını güncelle
      }
    },
  });

  return chromiumPath.executablePath;
}
