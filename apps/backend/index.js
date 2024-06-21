const express = require("express");
const cors = require("cors");
const { constructFilesObject } = require("./mount-utils");

const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.get("/mounted-data", async (req, res) => {
  try {
    const files = await constructFilesObject("./mount/data");
    return res.json(files);
  } catch (error) {
    console.error("Failed to construct files object:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
