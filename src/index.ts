import express from "express";
import { version } from "../package.json";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: "*" }));

app.listen(PORT, () => {
  console.log(`fish-info@${version} - listening at PORT ${PORT}`);
});
