import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);

// Later steps will add:
// router.use("/prospects", prospectRoutes);
// router.use("/cadences", cadenceRoutes);
// router.use("/enrollments", enrollmentRoutes);
// router.use("/dashboard", dashboardRoutes);

export default router;