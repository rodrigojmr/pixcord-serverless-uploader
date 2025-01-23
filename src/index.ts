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

export default async function (instance: FastifyInstance) {
  instance.get("/", async (req: FastifyRequest, res: FastifyReply) => {
    res.status(200).send({
      hello: "World"
    });
  });

  instance.post(
    "/",
    { preHandler: upload.single("file") },
    async (req, res) => {
      //@ts-ignore
      const buffer = await req.file?.buffer;

      console.log("rjm ~ buffer:", buffer);
      return uploadPicture(buffer)
        .then(url => {
          return res.code(200).send({ url });
        })
        .catch(console.log);
    }
  );

  instance.delete<{ Body: { urls: string[] } }>(
    "/",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            urls: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      }
    },
    (req, res) => {
      return Promise.allSettled(req.body.urls.map(url => deletePicture(url)))
        .then(() => {
          return res.code(200).send();
        })
        .catch(console.log);
    }
  );
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

function deletePicture(url: string): Promise<void> {
  const fileName = url.match(/(pixcord\/.+)\.jpg$/)?.[1];
  if (!fileName) return Promise.reject();
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.destroy(fileName, (error, result) => {
      if (error) {
        reject("Upload failed");
      } else {
        resolve();
      }
    });
  });
}
