import express from "express";
import { version } from "../package.json";
import dotenv from "dotenv";
import cors from "cors";
import fs from 'fs'
import { parse } from '@fast-csv/parse';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: "*" }));

app.get("/info", async (req, res) => {
    try {
      const result: any = []
    fs.createReadStream(`./assets/fangstdata_2022.csv`)
    .pipe(parse({ headers: true, delimiter: ';' }))
    .on('end', (rowCount: number) => res.send(`Parsed ${rowCount} rows`));


    // .pipe(csv({ separator: ';' }))
    // .on("headers", (headers) => console.log(headers))
    // .on('data', (data: any) => {
    //   const id: string = data["Fartøy ID"]
    //   if (id == "2013063493" && result.length < 20) {
    //     result.push({ art: data["Art"], vekt: data["Produktvekt"], place: data["Landingsfylke"], date: data["Dokument salgsdato"]})
    //   }
    // })
    // .on('end', () => res.send(result))
    } catch (e) {
        res.status(500).send(e.message)
    }
})

app.listen(PORT, () => {
  console.log(`fish-info@${version} - listening at PORT ${PORT}`);
});
