import * as dotenv from "dotenv";
dotenv.config();

import multer from "fastify-multer";
import cors from "@fastify/cors";
// Require the framework
import Fastify from "fastify";

import init from "./index.js";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true
});

app.register(cors, {
  origin: "*"
});
app.register(multer.contentParser);
// Register your application as a normal plugin.
app.register(init, {
  prefix: "/"
});

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};
