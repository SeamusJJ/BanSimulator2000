const fs = require("fs");
const path = require("path");

const root = __dirname;
const publicDir = path.join(root, "public");

if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true });
}

fs.mkdirSync(publicDir);

const files = fs.readdirSync(root);

for (const file of files) {
    const fullPath = path.join(root, file);

    if (
        file === "node_modules" ||
        file === "dist" ||
        file === "public" ||
        file === ".git" ||
        file === "app.jsx" ||
        file === "index.html" ||
        file === "styles.css" ||
        file === "main.js" ||
        file === "vite.config.js" ||
        file === "package.json" ||
        file === "package-lock.json"
    ) {
        continue;
    }

    fs.cpSync(fullPath, path.join(publicDir, file), {
        recursive: true
    });
}

console.log("Assets copied to public/");