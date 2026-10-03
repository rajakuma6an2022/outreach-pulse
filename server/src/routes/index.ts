import { Router } from "express";
import healthRoutes from "./health.routes";

const router = Router();

router.use("/health", healthRoutes);

// Later steps will add:
// router.use("/auth", authRoutes);
// router.use("/prospects", prospectRoutes);
// router.use("/cadences", cadenceRoutes);
// router.use("/enrollments", enrollmentRoutes);
// router.use("/dashboard", dashboardRoutes);

export default router;