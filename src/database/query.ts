import { Document, Species } from "@prisma/client";
import getVessel from "../directory/vessels";
import { z } from "zod";
import prisma from "./client";

export const addSpecies = async (species: Species[]) => {
  return await prisma.species.createMany({
    data: species,
  });
};

export const getDocuments = async (imo: string, year: string) => {
  const vessel = await getOrCreateVessel(imo)
  const reports = await prisma.document.findMany({
    where: {
      vessel_id: vessel.id,
      sale_date: {
        lte: new Date(`${year}-01-30`).toISOString(), // "2022-01-30T00:00:00.000Z"
        gte: new Date(`${year}-01-01`).toISOString(), // "2022-01-15T00:00:00.000Z"
      },
    },
    include: {
        catches: true
    }
  });

//   const species = await prisma.species.findMany()
//   const map = species.reduce<any>((res, curr) => {
//     const { id } = curr
//     delete curr.id
//     res[id] = curr
//     return res;
//   }, {})

  return reports
};

export const getOrCreateVessel = async (imo: string) => {
  let vessel = await prisma.vessel.findUnique({
    where: {
      imo
    }
  })

  if (vessel != null) {
    return vessel
  }

  const res: any = await getVessel(imo)
  const data = res.data[0]

  if (data == null) throw new Error("Vessel does not exist in records")

  const { id, imoNumber } = data

  return await prisma.vessel.create({
    data: {
      id,
      imo: imoNumber
    }
  })
}

export const ReportsRequestObject = z.object({
  vessel: z.string(),
  year: z.string()
})

export type ReportRequest = z.infer<typeof ReportsRequestObject>
