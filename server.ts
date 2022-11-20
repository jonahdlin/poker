import { createApi } from "src/api/index";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import path from "path";

const PORT = 3001;

const app = express();

app.use(compression());
app.use(helmet());

const root = path.join(__dirname, "client", "build");
app.use(express.static(root));
app.get("*", (req, res) => {
  res.sendFile("index.html", { root });
});

createApi(app);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
