import { Logger } from "@nestjs/common";
import path from "path";
import * as browsers from "@puppeteer/browsers";
import { Browser } from "@puppeteer/browsers";

export async function getChromiumPath() {
  const downloadsFolder = path.join(process.cwd(), ".chromium");
  const browserPlatform = browsers.detectBrowserPlatform();

  if (!browserPlatform) {
    Logger.error("Platform belirlenemedi.", "Chromium");
    process.exit(1);
  }

  const installedBrowsers = await browsers.getInstalledBrowsers({
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
  const buildId = await browsers.resolveBuildId(
    browsers.Browser.CHROME,
    browserPlatform,
    "latest"
  );

  let lastProgress = -1; // İlerleme oranını tutacak değişken
  const chromiumPath = await browsers.install({
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
