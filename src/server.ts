/* eslint no-unmodified-loop-condition: "off" */
import express from "express";
import { version } from "../package.json";
import dotenv from "dotenv";
import cors from "cors";
import { Prisma } from "./database/client";
import { getDocuments, ReportsRequestObject } from "./database/query";

dotenv.config();

const run = () => {
  const app = express();
  const PORT = process.env.PORT || 5001;

  app.use(cors({ origin: "*" }));

  app.get("/documents", async (req, res) => {
    try {
      const { vessel, year }: any = ReportsRequestObject.parse(req.query);
      const reports = await getDocuments(vessel, year);
      res.send(reports);
    } catch (e) {
      res.status(500).send(e);
    }
  });

  app.listen(PORT, () => {
    console.log(`fish-info@${version} - listening at PORT ${PORT}`);
  });

  Prisma();
};

export default run;
