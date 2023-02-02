import { Line, Document } from "@prisma/client";

export const readStringToDate = (line: any, key: string) => {
  if (line[key] == null || line[key] == "") {
    throw new Error(`Bad String when parsing Date for key "${key}"`);
  }

  const [date, month, year] = line[key].trim().split(".");
  const actual = new Date(`${month}-${date}-${year}`);

  if (isNaN(actual.getTime())) {
    // console.log(line)
    throw new Error(`Invalid Date for key "${key}"`);
  }

  return actual;
};

export const readStringToInt = (line: any, key: string) => {
  if (line[key] == null || line[key] == "") {
    // console.log(line)
    throw new Error(`Bad String when parsing Int for key "${key}"`);
  }
  const value = parseInt(line[key]);
  return isNaN(value) ? 0 : value;
};

export const readStringToFloat = (line: any, key: string) => {
  if (line[key] == null) {
    console.log(`Bad String when parsing Float for key "${key}"`)
    // throw new Error(`Bad String when parsing Float for key "${key}"`);
  }
  const value = parseFloat(line[key].trim().replace(",", "."));
  return isNaN(value) ? null : value;
};

export const readString = (line: any, key: string) => {
  if (line[key] == null) {
    // console.log(line)
    throw new Error(`Bad String for key "${key}"`);
  }

  return line[key];
};

export const readCatchId = (line: any) => {
  const fao = readString(line, "Art FAO (kode)");
  return `${readString(line, "Dokumentnummer")}-${readString(
    line,
    "Linjenummer"
  )}-${fao == "" ? "UKN" : fao}`;
};

const readSaleDate = (line: any): string => {
  try {
    return readStringToDate(line, "Dokument salgsdato").toISOString()
  } catch (e) {
    // Bad sales date, user landing instead
    return readStringToDate(line, "Landingsdato").toISOString()
  }
}

export const readLine = (data: any): { document: any; catch: Line } => {
  const document: string = readString(data, "Dokumentnummer");

  if (document == null) {
    throw new Error(`Bad Document ID ${document}`);
  }

  return {
    document: {
      id: document,
      lat: readStringToFloat(data, "Lat (hovedområde)"),
      lon: readStringToFloat(data, "Lon (hovedområde)"),
      sale_date: readSaleDate(data),
      last_catch_date: readStringToDate(data, "Siste fangstdato").toISOString(),
      landing_date: readStringToDate(data, "Landingsdato").toISOString(),
      type_id: readString(data, "Dokumenttype (kode)"),
      eqiupment_id: readString(data, "Redskap (kode)"),
      receive_nation: readString(data, "Mottakernasjonalitet (kode)"),
      receive_place: readString(data, "Landingskommune"),
      quota_id: readStringToInt(data, "Kvotetype (kode)").toString(),
      vessel_id: readString(data, "Fartøy ID"),
    },
    catch: {
      id: readCatchId(data),
      document_id: document,
      species_id: readStringToInt(data, "Art - FDIR (kode)").toString(),
      conservation_id: readString(data, "Konserveringsmåte (kode)"),
      product_weight: readStringToFloat(data, "Bruttovekt"),
      round_weight: readStringToFloat(data, "Rundvekt"),
    },
  };
};
