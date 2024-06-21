// Import the necessary modules
const fs = require("fs").promises;
const path = require("path");
const simpleGit = require("simple-git");

// Function to clone a public GitHub repository
async function clonePublicRepo(directoryPath, repoUrl) {
  const git = simpleGit();
  try {
    await fs.access(directoryPath);
    await fs.rm(directoryPath, { recursive: true, force: true });
  } catch (error) {
    // If the directory does not exist, create it
    await fs.mkdir(directoryPath, { recursive: true });
  }
  await git.clone(repoUrl, directoryPath);
}

// Function to recursively construct the files object
async function constructFilesObject(directoryPath, repoUrl) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files = {};

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files[entry.name] = {
        directory: await constructFilesObject(fullPath, repoUrl),
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

module.exports = { constructFilesObject, clonePublicRepo };
