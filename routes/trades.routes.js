import { Router } from "express";
import {
      postTrade,
      updateTrade,
      deleteTrade,
      getTrade,
      getAllTrades,
      getMyTrades
} from "../controllers/trades.controllers.js";
import { verifyJWT, verifySeller } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/post", verifyJWT, verifySeller, postTrade);
router.put("/update/:id", verifyJWT, verifySeller, updateTrade);
router.delete("/delete/:id", verifyJWT, verifySeller, deleteTrade);
router.get("/get/:id", verifyJWT, getTrade);
router.get("/all", verifyJWT, getAllTrades);
router.get("/my", verifyJWT, getMyTrades);

export default router;