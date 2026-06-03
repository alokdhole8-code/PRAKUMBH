const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputDir = "./public/clothes";
const outputDir = "./public/clothes-optimized";

async function processFolder(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.statSync(srcPath).isDirectory()) {
      await processFolder(srcPath, destPath);
    } else if (item.endsWith(".webp")) {
  console.log("Processing:", srcPath);

  try {
    await sharp(srcPath)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(destPath);

    const sizeKB = (
      fs.statSync(destPath).size / 1024
    ).toFixed(1);

    console.log(`✅ ${srcPath} -> ${sizeKB} KB`);
  } catch (err) {
    console.error(`❌ BAD FILE: ${srcPath}`);
    console.error(err.message);
  }
    }}
}

processFolder(inputDir, outputDir)
  .then(() => console.log("🎉 Done"))
  .catch(console.error);