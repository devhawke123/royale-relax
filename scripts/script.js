// scripts/prepare-images.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const CATEGORIES = ["beds", "fabrics", "mattresses"];
const RAW_ROOT = "./public/raw-images";
const DEST_ROOT = "./public/images/products";
const manifest = {};

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Tries to pull a color name out of a filename like "CH01 Chenille Cream.jpg"
// given the product folder name "Chenille". Falls back to null if it can't.
function extractColorName(filename, productName) {
  const base = path.parse(filename).name; // "CH01 Chenille Cream"
  const withoutCode = base.replace(/^[A-Za-z]{1,4}\d+\s*/, ""); // "Chenille Cream"
  const escapedProduct = productName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const withoutProductName = withoutCode
    .replace(new RegExp(escapedProduct, "i"), "")
    .trim();

  return withoutProductName.length > 0 ? withoutProductName : null;
}

async function processCategory(category) {
  const srcCategoryDir = path.join(RAW_ROOT, category);
  if (!fs.existsSync(srcCategoryDir)) {
    console.log(`Skipping ${category} — no folder found yet`);
    return;
  }

  manifest[category] = [];

  const productFolders = fs.readdirSync(srcCategoryDir, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const folder of productFolders) {
    const productName = folder.name;
    const slug = slugify(productName);
    const srcDir = path.join(srcCategoryDir, productName);
    const destDir = path.join(DEST_ROOT, category, slug);
    fs.mkdirSync(destDir, { recursive: true });

    const files = fs.readdirSync(srcDir).filter(f => /\.jpe?g$/i.test(f));
    const images = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const srcPath = path.join(srcDir, file);

      const colorName = extractColorName(file, productName);
      const outName =
        i === 0
          ? "main.webp"
          : colorName
          ? `color-${slugify(colorName)}.webp`
          : `color-${i}.webp`;

      const destPath = path.join(destDir, outName);

      await sharp(srcPath)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(destPath);

      images.push({
        path: `products/${category}/${slug}/${outName}`,
        color: colorName || null,
      });
      console.log(`${srcPath} -> ${destPath}`);
    }

    manifest[category].push({ name: productName, slug, images });
  }
}

async function run() {
  for (const category of CATEGORIES) {
    await processCategory(category);
  }
  fs.writeFileSync("./data/products-manifest.json", JSON.stringify(manifest, null, 2));
  console.log("\nDone. Manifest written to data/products-manifest.json");
}

run();