const fs = require("fs").promises;
const path = require("path");

async function constructFilesObject(directoryPath, repoUrl) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files = {};
  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files[entry.name] = {
        directory: await constructFilesObject(fullPath, repoUrl),
      };
    } else if (!entry.name.startsWith(".git")) {
      const contents = await fs.readFile(fullPath, "utf8");
      files[entry.name] = {
        file: {
          contents,
        },
      };
    }
  }
  return files;
}

module.exports = { constructFilesObject };
