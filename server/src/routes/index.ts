import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import prospectRoutes from "./prospect.routes";
import cadenceRoutes from "./cadence.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/prospects", prospectRoutes);
router.use("/cadences", cadenceRoutes);

// Later steps will add:
// router.use("/enrollments", enrollmentRoutes);
// router.use("/dashboard", dashboardRoutes);

export default router;