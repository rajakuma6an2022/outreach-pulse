import { Router } from "express";
import * as controller from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/ratelimit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { loginSchema, registerSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), asyncHandler(controller.register));
router.post("/login", authLimiter, validate(loginSchema), asyncHandler(controller.login));
router.post("/logout", asyncHandler(controller.logout));
router.get("/me", authenticate, asyncHandler(controller.me));

export default router;