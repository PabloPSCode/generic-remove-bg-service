import "dotenv/config";
import { app } from "./app";
import { config } from "./config/env";

app.listen({
  port: config.port,
  host: config.host,
})
