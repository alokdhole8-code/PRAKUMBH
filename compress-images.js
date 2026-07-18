const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputDir = "./public";
const maxWidth = 800;

async function compress(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await compress(fullPath);
    } else if (/\.(webp|jpg|jpeg|png)$/i.test(file)) {
      console.log("Compressing:", fullPath);

      const img = sharp(fullPath);
      const meta = await img.metadata();

      await img
        .resize({
          width: Math.min(meta.width, maxWidth),
          withoutEnlargement: true,
        })
        .webp({
          quality: 55,
          effort: 6,
        })
        .toFile(fullPath + ".tmp");

      fs.renameSync(fullPath + ".tmp", fullPath);
    }
  }
}

compress(inputDir).then(() => console.log("✅ Done"));