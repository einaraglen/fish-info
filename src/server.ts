/* eslint no-unmodified-loop-condition: "off" */
import express from "express";
import { version } from "../package.json";
import dotenv from "dotenv";
import cors from "cors";
import { Prisma } from "./database/client";

import v1 from "./v1/index"
import { readAndWriteBatches, insertFormattedData } from "./reader/reader";
import { createLog } from "./database/query";

const insert = async () => {
  await readAndWriteBatches("fangstdata_2017.csv")
  await insertFormattedData()
}

const run = () => {
  const app = express();
  const PORT = process.env.PORT || 5001;

  app.set("trust proxy", true) // allow us to track where requests are comming from
  app.use(cors({ origin: "*" }));

  // Log incomming traffic
  app.use((req, res, next) => {
    const { ip, url: endpoint } = req
    createLog({ ip, endpoint })
    next()
  })

  app.use("/v1", v1)

  app.listen(PORT, () =>
    console.log(`fish-info@${version} listening to port ${PORT}`)
  );

  Prisma()
}

export default run;
