// Import the necessary modules
const fs = require("fs").promises;
const path = require("path");

// Function to recursively construct the files object
async function constructFilesObject(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files = {};

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files[entry.name] = {
        directory: await constructFilesObject(fullPath),
      };
    } else {
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
