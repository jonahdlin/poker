import { createApi } from "src/api/index";
import express from "express";
import path from "path";

const PORT = 3001;

const app = express();

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
app.use(express.static(path.resolve(__dirname, "../client/build")));

createApi(app);
