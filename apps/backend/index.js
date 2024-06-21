const express = require("express");
const cors = require("cors");
const { constructFilesObject, clonePublicRepo } = require("./mount-utils");
require("dotenv").config();

const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.get("/mounted-data", async (req, res) => {
  try {
    const repoUrl = process.env.GIT_REPO;
    const mountPath = process.env.MOUNT_PATH;
    // Clone the repo before constructing the files object
    await clonePublicRepo(mountPath, repoUrl);

    const files = await constructFilesObject(mountPath, repoUrl);
    return res.json(files);
  } catch (error) {
    console.error("Failed to construct files object:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
