import { Router } from "express";
import {
      registerUser,
      loginUser,
      logoutUser
} from "../controllers/users.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);

export default router;