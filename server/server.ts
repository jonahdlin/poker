import { createApi } from "src/api/index";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import path from "path";
import { createServer } from "http";
import { parse } from "url";
import { TransientMockDatabase } from "src/db/db";

const PORT = 25565;
if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = "development";
}

const app = express();

app.use(compression());
app.use(helmet());

app.use(function (req, res, next) {
  res.setHeader("Content-Security-Policy", "script-src 'self'");
  return next();
});

// only serve web app if in prod
if (process.env.NODE_ENV === "production") {
  const clientRoot = path.join(__dirname, "build");
  app.use(express.static(clientRoot));
  app.get("*", (req, res) => {
    res.sendFile("index.html", { root: clientRoot });
  });
}

createApi(app);

const server = createServer(app).listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

server.on("upgrade", (req, socket, head) => {
  if (req.url == null) {
    socket.destroy();
    return;
  }
  const { pathname } = parse(req.url);

  if (pathname == null || !pathname.startsWith("/socket/")) {
    socket.destroy();
    return;
  }

  const components = pathname.split("/");
  const roomId = components.at(-1);

  if (roomId == null) {
    socket.destroy();
    return;
  }

  const wss = TransientMockDatabase.sessions[roomId]?.wss;

  if (wss == null) {
    socket.destroy();
    return;
  }

  console.log("received request to upgrade");

  wss.handleUpgrade(req, socket, head, (ws) => {
    console.log("upgrade completed");
    wss.emit("connection", ws, req);
  });
});
