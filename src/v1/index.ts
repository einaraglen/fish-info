import express from "express";
import { getDocuments, getVesselByIdentifier } from "../database/query";
import { DocumentsQueryObject, VesselQueryObject } from "./models";

const route = express.Router({ mergeParams: true })

route.get("/vessel", async (req, res) => {
    try {
        const payload = VesselQueryObject.parse(req.query)
        const vessel = await getVesselByIdentifier(payload)
        res.send(vessel)
    } catch (e) {
        res.status(500).send(e.message || "Internal Error")
    }
})

route.get("/documents", async (req, res) => {
    try {
        const payload = DocumentsQueryObject.parse(req.query)
        const documents = await getDocuments(payload)
        res.send(documents)
    } catch (e) {
        res.status(500).send(e.message || "Internal Error")
    }
})

export default route;