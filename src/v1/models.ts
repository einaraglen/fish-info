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

export const CatchesQueryObject = z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    document: z.string().optional()
})

export type CatchesQuery = z.infer<typeof CatchesQueryObject>