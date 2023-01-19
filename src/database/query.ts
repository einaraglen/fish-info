import { Document, Species } from "@prisma/client";
import getVessel from "../directory/vessels";
import { z } from "zod";
import prisma from "./client";

export const getDocuments = async (imo: string, from: string, to: string) => {
  const vessel = await getOrCreateVessel(imo);
  const reports = await prisma.document.findMany({
    where: {
      vessel_id: vessel.id,
      sale_date: {
        lte: new Date(to).toISOString(),
        gte: new Date(from).toISOString(), 
      },
    },
    orderBy: [
      {
        sale_date: "asc"
      }
    ]
  });
  return reports;
};

export const getCatches = async (document_id: string) => {
  const catches = await prisma.catch.findMany({
    where: {
      document_id
    },
    orderBy: [
      {
        landing_date: "asc"
      }
    ]
  })

  const species = await prisma.species.findMany()

  const map = species.reduce<any>((res, curr) => {
    const { id } = curr
    delete curr.id
    res[id] = curr
    return res
  }, {})

  return catches.map((c) => ({ ...c, species: map[c.species_id] }))
}


export const getDatabaseRange = async () => {
  const range =  await prisma.document.aggregate({
    _min: {
      sale_date: true
    },
    _max: {
      sale_date: true
    }
  })

  const { _min, _max } = range

  return { min: _min.sale_date, max: _max.sale_date }
}

export const getOrCreateVessel = async (imo: string) => {
  let vessel = await prisma.vessel.findUnique({
    where: {
      imo,
    },
  });

  if (vessel != null) {
    return vessel;
  }

  const res: any = await getVessel(imo);
  const data = res.data[0];

  if (data == null) throw new Error("Vessel does not exist in records");

  const { id, imoNumber } = data;

  return await prisma.vessel.create({
    data: {
      id,
      imo: imoNumber,
    },
  });
};

export const DocumentsRequestObject = z.object({
  vessel: z.string(),
  from: z.coerce.date(),
  to: z.coerce.date()
});

export type DocumentsRequest = z.infer<typeof DocumentsRequestObject>;

export const CatchesRequestObject = z.object({
  document_id: z.string(),
});

export type CatchesRequest = z.infer<typeof CatchesRequestObject>;

