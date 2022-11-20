import { createApi } from "src/api/index";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import path from "path";

const PORT = 3001;

const app = express();

app.use(compression());
app.use(helmet());

app.use(function (req, res, next) {
  res.setHeader("Content-Security-Policy", "script-src 'self'");
  return next();
});

const clientRoot = path.join(__dirname, "..", "client", "build");
app.use(express.static(clientRoot));
app.get("*", (req, res) => {
  res.sendFile("index.html", { clientRoot });
});

createApi(app);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
