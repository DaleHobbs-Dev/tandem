#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const command = process.argv[2];

if (command !== "init") {
  console.log("Usage: npx @tandemdev/cli init");
  console.log("");
  console.log("Installs Tandem commands and templates into your project.");
  process.exit(1);
}

const projectRoot = process.cwd();
const packageRoot = path.resolve(__dirname, "..");

const commandsSource = path.join(packageRoot, "commands");
const templatesSource = path.join(packageRoot, "templates");

const commandsDest = path.join(projectRoot, ".claude", "commands");
const templatesDest = path.join(projectRoot, ".tandem", "templates");

// Ensure destination directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy all files from source to destination
function copyFiles(source, dest) {
  const files = fs.readdirSync(source);
  const copied = [];

  for (const file of files) {
    const srcPath = path.join(source, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath);
      copied.push(file);
    }
  }

  return copied;
}

console.log("");
console.log("  Tandem - Ownership and speed, not ownership or speed.");
console.log("");

// Copy commands
ensureDir(commandsDest);
const commands = copyFiles(commandsSource, commandsDest);
console.log(`  Commands installed to .claude/commands/`);
for (const cmd of commands) {
  const name = cmd.replace(".md", "");
  console.log(`    /${name}`);
}

// Copy templates
ensureDir(templatesDest);
const templates = copyFiles(templatesSource, templatesDest);
console.log("");
console.log(`  Templates installed to .tandem/templates/`);
for (const tpl of templates) {
  console.log(`    ${tpl}`);
}

console.log("");
console.log("  Quick start:");
console.log("    New project:      /create-prd");
console.log("    Existing project: /create-manifest");
console.log("    Start building:   /pair-program");
console.log("");
