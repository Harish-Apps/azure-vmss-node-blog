const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/static", express.static(path.join(__dirname, "public")));

const BLOG_TITLE = process.env.BLOG_TITLE || "My Personal Blog";
const POSTS = [
  { title: "Hello, World 👋", date: "2025-08-08", content: "First post deployed on Azure VMSS!" },
  { title: "Why VMSS?", date: "2025-08-08", content: "Auto scale, self-heal, and rolling updates made simple." }
];

app.get("/", (req, res) => {
  res.render("index", { title: BLOG_TITLE, posts: POSTS });
});

app.get("/health", (req, res) => res.status(200).send("OK"));

app.listen(PORT, () => {
  console.log(`Blog running on port ${PORT}`);
});
