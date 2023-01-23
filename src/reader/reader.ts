import fs from "fs";
import csv from "csv-parser";
import { Catch, Document, Species } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

export const readStringToDate = (data: string, line: any) => {
  if (data == null) {
    throw new Error("Bad String when parsing Date");
  }

  const [date, month, year] = data.trim().split(".");
  const actual = new Date(`${month}-${date}-${year}`);

  if (isNaN(actual.getTime())) {
    // console.log(line)
    // console.log(date, actual, data, month, year)
    // console.log("Invalid Date")
    return undefined
  }

  return actual;
};

export const readStringToInt = (data: string) => {
  if (data == null) {
    throw new Error("Bad String when parsing Int");
  }
  const value = parseInt(data);
  return isNaN(value) ? 0 : value;
};

export const readStringToFloat = (data: string) => {
  if (data == null) {
    throw new Error("Bad String when parsing Float");
  }
  const value = parseFloat(data.trim().replace(",", "."));
  return isNaN(value) ? 0 : value;
};

export const readCatchId = (line: any) => {
  const fao = line["Art FAO (kode)"];
  return `${line["Dokumentnummer"]}-${line["Linjenummer"]}-${
    fao == "" ? "UKN" : fao
  }`;
};

const readLine = (data: any): { document: Document; catch: Catch } => {
  const document: string = data["Dokumentnummer"];
  let species_id = readStringToInt(data["Art - FDIR (kode)"]).toString();

  if (data["Art FAO (kode)"] == "") {
    console.log("BAD FAO CODE", species_id);
  }

  if (document == null) {
    throw new Error(`Bad Document ID ${document}`);
  }

  return {
    document: {
      id: document,
      lat: readStringToFloat(data["Lat (hovedområde)"]),
      lon: readStringToFloat(data["Lon (hovedområde)"]),
      sale_date: readStringToDate(data["Dokument salgsdato"], data),
      last_catch_date: readStringToDate(data["Siste fangstdato"], data),
      landing_date: readStringToDate(data["Landingsdato"], data),
      type_id: data["Dokumenttype (kode)"],
      eqiupment_id: data["Redskap (kode)"],
      receive_nation: data["Mottakernasjonalitet (kode)"],
      receive_place: data["Landingskommune"],
      quota_id: readStringToInt(data["Kvotetype (kode)"]).toString(),
      vessel_id: data["Fartøy ID"],
    },
    catch: {
      id: readCatchId(data),
      document_id: document,
      species_id,
      conservation_id: data["Konserveringsmåte (kode)"],
      product_weight: readStringToFloat(data["Bruttovekt"]),
      round_weight: readStringToFloat(data["Rundvekt"]),
    },
  };
};

const batch = 10000;

const add = async (results: any[], prisma: PrismaClient) => {
  let cursor = 0;
  while (cursor < results.length) {
    const progress = ((cursor + batch) / results.length) * 100;

    console.log(
      `Insert Progress ${progress.toFixed(2)}% - from ${cursor} to ${
        cursor + batch
      } of ${results.length}`
    );

    const [documents, catches] = results
      .slice(cursor, cursor + batch)
      .reduce<any>(
        (res, curr) => {
          if (
            res[0].get(curr.document.id) == null &&
            curr.document.id != null
          ) {
            res[0].set(curr.document.id, curr.document);
          }
          res[1].push(curr.catch);
          return res;
        },
        [new Map(), []]
      );

    const docs = await prisma.document.createMany({
      data: Array.from(documents, ([key, value]) => value),
      skipDuplicates: true,
    });

    const cat = await prisma.catch.createMany({
      data: catches,
      skipDuplicates: true,
    });

    console.log(`Added ${cat.count} catches + ${docs.count} documents`);

    cursor += batch;
  }

  return "Complete";
};

const step = 100000;

const readBatch = async (step: number, round: number) => {
  return new Promise(async (resolve, reject) => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    let index = 0;

    const results: any = [];

    const start = step * round;
    const end = step * (round + 1);

    fs.createReadStream(`./assets/fangstdata_2019.csv`)
      .pipe(
        csv({
          separator: ";",
          mapHeaders: ({ header, index }) => header.trim(),
        })
      )
      .on("data", (line: any) => {
        if (index >= start && index < end) {
          results.push(readLine(line));
        }
        index++;
      })
      .on("end", async () => {
        if (results.length === 0) {
          reject("End of file");
        }
        console.log(`Adding ${results.length} records`);
        await add(results, prisma);
        await prisma.$disconnect();
        resolve("Batch complete");
      });
  });
};

export const readCatch = async () => {
  let round = 0;
  let running = true;

  while (running) {
    try {
      console.log(`Reading batch ${round}`);
      const res = await readBatch(step, round);
      console.log(res);
      round++;
    } catch (e) {
      console.log(e);
      running = false;
    }
  }

  process.exit(0);
};

const headers = ["id", "no", "en", "code", "la"];

export const readSpecies = () => {
  const res: any = [];
  fs.createReadStream(`./assets/art_koder_full.csv`)
    .pipe(csv({ separator: ";" }))
    .on("data", (line: any) => {
      const data: any = {};
      const keys = Object.keys(line);
      for (let i = 0; i < keys.length; i++) {
        if (headers[i] == "id") {
          data[headers[i]] = parseInt(line[keys[i]]).toString();
        } else {
          data[headers[i]] = line[keys[i]];
        }
      }
      if (data.code != "") {
        res.push(data);
      }
    })
    .on("end", async () => {
      const prisma = new PrismaClient();
      await prisma.$connect();

      const count = await prisma.species.createMany({
        data: res,
        skipDuplicates: true,
      });

      console.log("Added species", count.count);
    });
};

export const readOther = () => {
  const res: any = [];
  fs.createReadStream(`./assets/quota.csv`)
    .pipe(csv({ separator: ";" }))
    .on("data", (line: any) => {
      const data: any = {};
      const keys = Object.keys(line);
      for (let i = 0; i < keys.length; i++) {
        data[headers[i]] = line[keys[i]];
      }
      if (data.code != "") {
        res.push(data);
      }
    })
    .on("end", async () => {
      const prisma = new PrismaClient();
      await prisma.$connect();

      const count = await prisma.quota.createMany({
        data: res,
        skipDuplicates: true,
      });

      console.log("Added other", count.count);
    });
};
