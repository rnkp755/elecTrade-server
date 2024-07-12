import express from "express"
import cors from "cors"

const app = express();

app.use(cors());
app.use(express.json());

//Routers
import tradesRouter from "./routes/trades.routes.js";
import bidsRouter from "./routes/bids.routes.js";

app.use("/api/v1/trade", tradesRouter);
app.use("/api/v1/bid", bidsRouter);

export default app;
