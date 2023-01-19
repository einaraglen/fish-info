/* eslint no-unmodified-loop-condition: "off" */
import express from "express";
import { version } from "../package.json";
import dotenv from "dotenv";
import cors from "cors";
import { Prisma } from "./database/client";
import { getCatches, getDocuments, DocumentsRequestObject, CatchesRequestObject, getDatabaseRange } from "./database/query";

dotenv.config();

const run = () => {
  const app = express();
  const PORT = process.env.PORT || 5001;

  app.use(cors({ origin: "*" }));

  app.get("/documents", async (req, res) => {
    try {
      const { vessel, from, to }: any = DocumentsRequestObject.parse(req.query);
      const documents = await getDocuments(vessel, from, to);
      res.send(documents);
    } catch (e) {
      res.status(500).send(e);
    }
  });

  app.get("/range", async (req, res) => {
    try {
      const range = await getDatabaseRange();
      res.send(range);
    } catch (e) {
      res.status(500).send(e);
    }
  });

  app.get("/catches/:document_id", async (req, res) => {
    try {
      const { document_id }: any = CatchesRequestObject.parse(req.params);
      const catches = await getCatches(document_id);
      res.send(catches);
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
