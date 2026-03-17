import sharp from "sharp";

await sharp("public/logo.png").resize(192, 192).toFile("public/icon-192.png");
console.log("icon-192.png cree");

await sharp("public/logo.png").resize(512, 512).toFile("public/icon-512.png");
console.log("icon-512.png cree");
