/* eslint no-unmodified-loop-condition: "off" */
import express from "express";
import { version } from "../package.json";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const run = async () => {
  const app = express();
  const PORT = process.env.PORT || 5001;

  app.use(cors({ origin: "*" }));

  app.use("/v1", )

  app.listen(PORT, () =>
    console.log(`fish-info@${version} listening to port ${PORT}`)
  );
};

export default run;
