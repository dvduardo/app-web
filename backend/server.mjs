import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import next from "next";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const certFile = fs.readFileSync(
    path.join(__dirname, "../certs/192.168.0.10+3.pem")
  );
  const keyFile = fs.readFileSync(
    path.join(__dirname, "../certs/192.168.0.10+3-key.pem")
  );

  const httpsServer = https.createServer(
    {
      cert: certFile,
      key: keyFile,
    },
    (req, res) => handle(req, res)
  );

  httpsServer.listen(3000, "0.0.0.0", (err) => {
    if (err) {
      console.error("Failed:", err);
      process.exit(1);
    }

    console.log("▲ Next.js 16.2.1 (HTTPS)");
    console.log("- Local:   https://localhost:3000");
    console.log("- Network: https://192.168.0.10:3000");
    console.log("Ready");
  });
});
