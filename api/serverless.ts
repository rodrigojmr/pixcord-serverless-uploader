import * as dotenv from "dotenv";
dotenv.config();

import multer from "fastify-multer";
import cors from "@fastify/cors";

// Require the framework
import Fastify from "fastify";

// Instantiate Fastify with some config
const app = Fastify({
  logger: false
});

app.register(cors, {
  origin: true
});
app.register(multer.contentParser);
// Register your application as a normal plugin.
app.register(import("../functions/index"), {
  prefix: "/"
});

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};
