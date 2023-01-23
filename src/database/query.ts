import getVessel from "../directory/vessels";
import { z } from "zod";
import prisma from "./client";
import { CatchesQuery, DocumentsQuery, VesselQuery } from "../v1/models"

export const getDocuments = async ({ imo, from, to }: DocumentsQuery) => {
  const vessel = await getOrCreateVessel(imo);
  return await prisma.document.findMany({
    where: {
      vessel_id: vessel.id,
      sale_date: {
        lte: new Date(to).toISOString(),
        gte: new Date(from).toISOString(), 
      },
    },
    include: {
      type: true,
      equipment: true,
      quota: true
    },
    orderBy: [
      {
        sale_date: "asc"
      }
    ]
  });
};

export const getCatches = async ({ document }: CatchesQuery) => {
  return await prisma.catch.findMany({
    where: {
      document_id: document
    },
    include: {
      species: true,
      conservation: true
    }
  })
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

export const getVesselByIdentifier = async ({ imo, id }: VesselQuery) => {
  if (imo == null && id == null) {
    throw new Error("Query needs either 'imo' of 'id'")
  }

  const where = imo ? { imo } : { id }
  return await prisma.vessel.findUnique({ where })
}