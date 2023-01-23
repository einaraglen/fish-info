import express from "express";
import { getCatches, getDocuments, getVesselByIdentifier } from "../database/query";
import { CatchesQueryObject, DocumentsQueryObject, VesselQueryObject } from "./models";

const route = express.Router({ mergeParams: true })

route.get("/vessel", async (req, res) => {
    try {
        const payload = VesselQueryObject.parse(req.query)
        const vessel = await getVesselByIdentifier(payload)
        res.send(vessel)
    } catch (e) {
        res.status(500).send(e)
    }
})

route.get("/documents", async (req, res) => {
    try {
        const payload = DocumentsQueryObject.parse(req.query)
        const documents = await getDocuments(payload)
        res.send(documents)
    } catch (e) {
        res.status(500).send(e)
    }
})

route.get("/catches", async (req, res) => {
    try { 
        const payload = CatchesQueryObject.parse(req.query)
        const catches = await getCatches(payload)
        res.send(catches)
    } catch (e) {
        res.status(500).send(e)
    }
})

export default route;