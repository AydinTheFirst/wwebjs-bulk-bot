import fs from "fs";
import path from "path";

const source = path.resolve(process.cwd(), "apps", "client", "dist");
const destination = path.resolve(process.cwd(), "output", "public");

// Klasörü ve içindeki dosyaları kopyalayan fonksiyon
const copyRecursiveSync = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true }); // Klasörü oluştur
  }

  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyRecursiveSync(srcPath, destPath); // Klasörse, içini kopyala
    } else {
      fs.copyFileSync(srcPath, destPath); // Dosyaysa, direkt kopyala
    }
  });
};

// Kaynak klasörü hedefe kopyala
copyRecursiveSync(source, destination);

console.log(`📂 ${source} içeriği ${destination} içine kopyalandı!`);
