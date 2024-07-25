import express from "express"
import cors from "cors"
import cookieparser from "cookie-parser"

const app = express();

app.use(cors({
      origin: "*",
      Credentials: true
}))
app.use(express.json());
app.use(cookieparser())

//Routers
import userRouter from "./routes/users.routes.js"
import tradesRouter from "./routes/trades.routes.js";
import bidsRouter from "./routes/bids.routes.js";

app.use('/api/v1/users', userRouter)
app.use("/api/v1/trade", tradesRouter);
app.use("/api/v1/bid", bidsRouter);

export default app;
