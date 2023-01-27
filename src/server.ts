/* eslint no-unmodified-loop-condition: "off" */
import express from "express";
import { version } from "../package.json";
import dotenv from "dotenv";
import cors from "cors";
import { Prisma } from "./database/client";

import v1 from "./v1/index"
import { readAndWriteBatches, insertFormattedData } from "./reader/reader";

dotenv.config();

const test = async () => {
  await readAndWriteBatches("fangstdata_2023.csv")
  await insertFormattedData()
}

const run = () => {
  const app = express();
  const PORT = process.env.PORT || 5001;

  app.use(cors({ origin: "*" }));

  app.use("/v1", v1)

  app.listen(PORT, () =>
    console.log(`fish-info@${version} listening to port ${PORT}`)
  );

//https://register.fiskeridir.no/uttrekk/fangstdata_2023.csv.zip
  Prisma()
};

export default run;
