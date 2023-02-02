import { z } from "zod";

export const VesselQueryObject = z.object({
  imo: z.string().optional(),
  id: z.string().optional(),
});

export type VesselQuery = z.infer<typeof VesselQueryObject>;

export const DocumentsQueryObject = z.object({
  imo: z.string(),
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export type DocumentsQuery = z.infer<typeof DocumentsQueryObject>;

export const DocumentQueryObject = z.object({
    id: z.string().optional()
})

export type DocumentQuery = z.infer<typeof DocumentQueryObject>