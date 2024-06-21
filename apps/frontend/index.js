import express from "express";

const app = express();
const port = 3003;

app.get("/", (req, res) => {
  res.send(`App is live at http://localhost: ${port}`);
});

app.listen(port, () => {
  console.log(`App is live at http://localhost: ${port}`);
});
