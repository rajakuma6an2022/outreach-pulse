import { Router } from "express";
import * as controller from "../controllers/cadence.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { cadenceIdSchema, createCadenceSchema } from "../validators/cadence.validator";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(controller.list));
router.get("/:id", validate(cadenceIdSchema), asyncHandler(controller.getOne));
// ADMIN mattum create panna mudiyum
router.post(
  "/",
  authorize("ADMIN"),
  validate(createCadenceSchema),
  asyncHandler(controller.create)
);

export default router;