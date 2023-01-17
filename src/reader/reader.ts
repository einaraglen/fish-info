import fs from "fs";
import csv from "csv-parser";
import { Catch, Document, Species } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

export const readStringToDate = (data: string) => {
  const [date, month, year] = data.trim().split(".")
  const actual = new Date(`${month}-${date}-${year}`)
  if (isNaN(actual.getTime())) console.log("BAD")
  return actual
};

export const readStringToInt = (data: string) => {
  const value = parseInt(data);
  return isNaN(value) ? 0 : value;
};

export const readStringToFloat = (data: string) => {
  const value = parseFloat(data.trim().replace(",", "."));
  return isNaN(value) ? 0 : value;
};

const readLine = (data: any): { document: Document, catch: any } => {
  const document: string = data["Dokumentnummer"];
  return {
    document: {
      id: document,
      sale_date: readStringToDate(data["Dokument salgsdato"]),
      lat: readStringToFloat(data["Lat (hovedområde)"]),
      lon: readStringToFloat(data["Lon (hovedområde)"]),
      eqiupment_type: readStringToInt(data["Redskap (kode)"]),
      receive_nation: data["Mottakernasjonalitet (kode)"],
      receive_place: data["Landingskommune"],
      quota_type: readStringToInt(data["Kvotetype (kode)"]),
      vessel_id: data["Fartøy ID"],
    },
    catch: {
      document_id: document,
      landing_date: readStringToDate(data["Landingsdato"]),
      species_id: data["Art FAO (kode)"],
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
          if (res[0].get(curr.document.id) == null && curr.document.id != null) {
            res[0].set(curr.document.id, curr.document);
          }
          res[1].push(curr.catch);
          return res;
        },
        [new Map(), []]
      );

    const docs = await prisma.document.createMany({
      data: Array.from(documents, ([key, value]) => value),
      skipDuplicates: true
    });

    console.log(`Added ${docs.count} documents`)

    const cat = await prisma.catch.createMany({
      data: catches,
    });

    console.log(`Added ${cat.count} catches`)

    cursor += batch;
  }

  return "Complete";
};

const step = 100000;

const readBatch = async (step: number, round: number) => {
  return new Promise(async (resolve, reject) => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const results: any = [];

    let index = 0;

    const start = step * round;
    const end = step * (round + 1);

    fs.createReadStream(`./assets/fangstdata_2022.csv`)
      .pipe(csv({ separator: ";" }))
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
};

export const readSpecies = () => {
  return new Promise((resolve, reject) => {
    const result: any = [];
    fs.createReadStream(`./assets/art_koder.csv`)
      .pipe(csv({ separator: ";" }))
      .on("data", (data: any) => {
        try {
          const line: Species = {
            id: data["KODE"],
            no: data["NAVN_NORSK"].replaceAll("*", ""),
            en: data["NAVN_ENGELSK"].replaceAll("*", ""),
            la: data["NAVN_LATINSK"].replaceAll("*", ""),
          };
          result.push(line);
        } catch (e) {
          console.warn("Failed to parse line");
        }
      })
      .on("end", () => resolve(result));
  });
};
