import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions
} from "fastify";

import cloudinary from "cloudinary";
import multer from "fastify-multer";

cloudinary.v2.config({
  cloud_name: process.env.CDN_CLOUD_NAME,
  api_key: process.env.CDN_API_KEY,
  api_secret: process.env.CDN_API_SECRET
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default async function (
  instance: FastifyInstance,
  opts: FastifyServerOptions,
  done
) {
  instance.get("/", async (req: FastifyRequest, res: FastifyReply) => {
    res.status(200).send({
      hello: "World"
    });
  });

  instance.register(
    async (instance: FastifyInstance, opts: FastifyServerOptions, done) => {
      instance.post(
        "/",
        { preHandler: upload.single("file") },
        async (req, res) => {
          try {
            // @ts-ignore
            const buffer = await req.file.buffer;
            const url = await uploadPicture(buffer);
            res.code(200).send({ url });
          } catch (error) {
            console.log("rjm ~ error", error);
          }
        }
      );
      done();
    }
  );

  done();
}

function uploadPicture(content: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader
      .upload_stream(
        {
          folder: "pixcord"
        },
        (error, result) => {
          if (error) {
            reject("Upload failed");
          } else {
            resolve(result?.url || "");
          }
        }
      )
      .end(content);
  });
}
