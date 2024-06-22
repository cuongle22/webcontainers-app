const fs = require("fs").promises;
const simpleGit = require("simple-git");

async function clonePublicRepo(directoryPath, repoUrl) {
  const git = simpleGit();
  try {
    await fs.access(directoryPath);
    await fs.rm(directoryPath, { recursive: true, force: true });
  } catch (error) {
    await fs.mkdir(directoryPath, { recursive: true });
  }
  await git.clone(repoUrl, directoryPath);
}

module.exports = { clonePublicRepo };
