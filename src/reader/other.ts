import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";

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
