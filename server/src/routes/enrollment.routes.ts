import { Router } from "express";
import * as controller from "../controllers/enrollment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { createEnrollmentSchema } from "../validators/enrollment.validator";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(controller.list));
router.post("/", validate(createEnrollmentSchema), asyncHandler(controller.create));

export default router;