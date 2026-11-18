import express from "express";
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
} from "../controllers/leadController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all lead routes
router.use(isAuthenticated);

router.route("/")
  .get(getLeads)
  .post(createLead);

router.route("/:id")
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

router.route("/:id/status")
  .patch(updateLeadStatus);

export default router;
