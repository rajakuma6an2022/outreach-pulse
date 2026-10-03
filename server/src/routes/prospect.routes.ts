import { Router } from "express";
import * as controller from "../controllers/prospect.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createProspectSchema,
  listProspectsSchema,
  prospectIdSchema,
} from "../validators/prospect.validator";

const router = Router();

// Ella prospect routes-um login venum
router.use(authenticate);

router.get("/", validate(listProspectsSchema), asyncHandler(controller.list));
router.post("/", validate(createProspectSchema), asyncHandler(controller.create));
router.get("/:id", validate(prospectIdSchema), asyncHandler(controller.getOne));
router.delete("/:id", validate(prospectIdSchema), asyncHandler(controller.remove));

export default router;