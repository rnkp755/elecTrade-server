import { Router } from "express";
import {
      postBid,
      getMyBids
} from "../controllers/bids.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/:id", verifyJWT, postBid);
router.get("/my", verifyJWT, getMyBids);

export default router;