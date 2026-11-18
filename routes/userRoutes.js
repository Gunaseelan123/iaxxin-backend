import express from "express"
import multer from "multer";

import { adminLogin, createAdmin, loginUser, getAllUsers } from "../controllers/userController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();
const uploader = multer();

router.get("/", isAuthenticated, getAllUsers);
router.post("/adminlogin", uploader.none(), adminLogin);
router.post("/create-admin", isAuthenticated, authorizeRoles("admin"), uploader.none(), createAdmin);
router.post("/login", uploader.none(), loginUser);

  

export default router;
