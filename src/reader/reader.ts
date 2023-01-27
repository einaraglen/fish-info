import fs from "fs";
import path from "path";
import { Catch, Document } from "@prisma/client";
import { parse, format, CsvFormatterStream } from "fast-csv";
import { readLine } from "./utils";
import prisma from "../database/client";

const clamp = (value: number) => Math.min(Math.max(value, 0), 100).toFixed(1);

const BATCH_COUNT = 100000;
const SECTION_COUNT = 10000;
const TMP_DIR = "./tmp";

const cleanup = () => {
  fs.readdir(TMP_DIR, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(TMP_DIR, file), (err) => {
        if (err) throw err;
      });
    }
  });
};

const insertDocuments = (documents: any[]): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    let cursor = 0;

    while (cursor < documents.length) {
      const docs = await prisma.document.createMany({
        data: documents.slice(cursor, cursor + SECTION_COUNT),
        skipDuplicates: true,
      });

      const progress = ((cursor + SECTION_COUNT) / documents.length) * 100;

      console.log(`${clamp(progress)}% | Inserted ${docs.count} documents`);

      cursor += SECTION_COUNT;
    }

    resolve();
  });
};

const insertCatches = (catches: any[]): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    let cursor = 0;

    while (cursor < catches.length) {
      const cat = await prisma.catch.createMany({
        data: catches.slice(cursor, cursor + SECTION_COUNT),
        skipDuplicates: true,
      });

      const progress = ((cursor + SECTION_COUNT) / catches.length) * 100;

      console.log(`${clamp(progress)}% | Inserted ${cat.count} catches`);

      cursor += SECTION_COUNT;
    }

    resolve();
  });
};

const formatDocument = (line: any) => {
  const { last_catch_date, landing_date, lat, lon } = line;
  delete line.last_catch_date;
  delete line.landing_date;
  delete line.lat;
  delete line.lon;

  const f_lat = isNaN(parseFloat(lat)) ? 0 : parseFloat(lat);
  const f_lon = isNaN(parseFloat(lon)) ? 0 : parseFloat(lon);

  return {
    ...line,
    last_catch_date: new Date(last_catch_date),
    landing_date: new Date(landing_date),
    lat: f_lat,
    lon: f_lon,
  };
};

const readFormattedDocuments = (batch: number): Promise<Document[]> => {
  return new Promise((resolve, reject) => {
    const documents = new Map();

    const stream = fs.createReadStream(`./tmp/document${batch}.csv`);

    stream
      .pipe(parse({ headers: true }))
      .on("data", (line) => {
        documents.set(line.id, formatDocument(line));
      })
      .on("end", () => resolve(Array.from(documents, ([key, value]) => value)));
  });
};

const formatCatch = (line: any) => {
  const { product_weight, round_weight } = line;
  delete line.product_weight;
  delete line.round_weight;

  const f_product_weight = isNaN(parseFloat(product_weight))
    ? 0
    : parseFloat(product_weight);
  const f_round_weight = isNaN(parseFloat(round_weight))
    ? 0
    : parseFloat(round_weight);
  return {
    ...line,
    product_weight: f_product_weight,
    round_weight: f_round_weight,
  };
};

const readFormattedCatches = (batch: number): Promise<Catch[]> => {
  return new Promise((resolve, reject) => {
    const catches: any = [];

    const stream = fs.createReadStream(`./tmp/catch${batch}.csv`);

    stream
      .pipe(parse({ headers: true }))
      .on("data", (line) => catches.push(formatCatch(line)))
      .on("end", () => resolve(catches));
  });
};

export const insertFormattedData = async () => {
  let batch = 0;

  while (
    fs.existsSync(`./tmp/document${batch}.csv`) &&
    fs.existsSync(`./tmp/catch${batch}.csv`)
  ) {
    console.log(
      "\n\x1b[33m##\x1b[0m",
      `Starting insertion of batch ${batch}`,
      "\x1b[33m##\x1b[0m\n"
    );

    const [documents, catches] = await Promise.all([
      readFormattedDocuments(batch),
      readFormattedCatches(batch),
    ]);

    await insertDocuments(documents)
    await insertCatches(catches)

    batch++;
  }

  console.log(
    "\x1b[33m##\x1b[0m",
    "Completed insertion of dataset!",
    "\x1b[33m##\x1b[0m"
  );

  cleanup();
};

const init = (type: "document" | "catch", batch: number) => {
  const output_stream = format({ headers: true });
  const write_stream = fs.createWriteStream(`./tmp/${type}${batch}.csv`);
  output_stream.pipe(write_stream);
  return output_stream;
};

export const readAndWriteBatches = (file: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    let index = 0;
    let batch = 0;

    const input_stream = fs.createReadStream(`./assets/${file}`);
    let document_stream: CsvFormatterStream<any, any>;
    let catch_stream: CsvFormatterStream<any, any>;

    input_stream
      .pipe(parse({ delimiter: ";", headers: true }))
      .on("error", (err) => reject(err))
      .on("data", (line) => {
        if (index % BATCH_COUNT == 0) {
          console.log(`Starting read and write for batch ${batch}`);
          document_stream = init("document", batch);
          catch_stream = init("catch", batch);
          batch++;
        }

        const formatted = readLine(line);

        document_stream.write(formatted.document);
        catch_stream.write(formatted.catch);

        index++;
      })
      .on("end", (count: number) => {
        document_stream.end();
        catch_stream.end();
        console.log(
          "\x1b[33m##\x1b[0m",
          `Completed read and write for ${count} rows`,
          "\x1b[33m##\x1b[0m"
        );
        resolve();
      });
  });
};
