import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import prospectRoutes from "./prospect.routes";
import cadenceRoutes from "./cadence.routes";
import enrollmentRoutes from "./enrollment.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/prospects", prospectRoutes);
router.use("/cadences", cadenceRoutes);
router.use("/enrollments", enrollmentRoutes);

// Later steps will add:
// router.use("/dashboard", dashboardRoutes);

export default router;