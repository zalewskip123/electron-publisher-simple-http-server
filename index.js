const http = require("http");
const fs = require("fs");
const path = require("path");

const mkDirByPathSync = require("./mkDirByPathSync");
const url = require("url");

const DATA_DIR = path.join("./storage");

http
  .createServer(async (req, res) => {
    if (req.method === "POST") {
      console.log("add", req.headers);
      console.log("add", req.url);

      const fileContent = await new Promise((resolve, reject) => {
        const body = [];
        req.on("data", chunk => body.push(chunk));
        req.on("end", () => resolve(Buffer.concat(body)));
        req.on("error", reject);
      });
      const u = url.parse(req.url);
      const dir = path.join(DATA_DIR, u.pathname);
      mkDirByPathSync(dir);

      await fs.promises.writeFile(
        path.join(dir, req.headers["x-file-name"]),
        fileContent
      );
      res.writeHead(200);
      res.end();
    } else if (req.method === "GET") {
      const u = url.parse(req.url);
      const filepath = path.join(DATA_DIR);
      console.log("read", filepath);
      const rs = fs.createReadStream(filepath);
      rs.on("error", err => {
        console.log("read err", err, filepath);
        res.writeHead(404);
        res.end();
      });
      rs.pipe(res);
    }
  })
  .listen(8080);
