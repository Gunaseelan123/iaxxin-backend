import jwt from "jsonwebtoken"
import User from "../models/userModel.js"


const sanitizeInput = (value) =>
    typeof value === "string" ? value.trim() : "";

const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const adminLogin = async (req, res, next) => {
    try {
        const email = sanitizeInput(req.body.email);
        const password = sanitizeInput(req.body.password);

        if (!email) {
            const error = new Error("email is required");
            error.status = 400;
            throw error;
        }

        if (!password) {
            const error = new Error("Password is required");
            error.status = 400;
            throw error;
        }

        const admin = await User.findOne({ email }).select("+password");

        if (!admin || admin.role !== "admin") {
            const error = new Error("Invalid email or password");
            error.status = 401;
            throw error;
        }



        const isPasswordMatched = await admin.comparePassword(password);

        if (!isPasswordMatched) {
            const error = new Error("Invalid password");
            error.status = 401;
            throw error;
        }

        if (!process.env.JWT_SECRET) {
            const error = new Error("JWT_SECRET is not configured");
            error.status = 500;
            throw error;
        }

        const token = generateToken(admin._id);

        res.status(200).json({
            success: true,
            message: "Admin login successful",
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        next(error);
    }
}

export const createAdmin = async (req, res, next) => {
    try {
        const name = sanitizeInput(req.body.name);
        const email = sanitizeInput(req.body.email).toLowerCase();
        const password = sanitizeInput(req.body.password);

        if (!name) {
            const error = new Error("Name is required");
            error.status = 400;
            throw error;
        }

        if (!email) {
            const error = new Error("Email is required");
            error.status = 400;
            throw error;
        }

        if (!password) {
            const error = new Error("Password is required");
            error.status = 400;
            throw error;
        }



        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const error = new Error("User already exists with this email");
            error.status = 409;
            throw error;
        }


        const role = sanitizeInput(req.body.role) || "user";

        const admin = await User.create({
            name,
            email,
            password,
            role,
        });

        res.status(201).json({
            success: true,
            message: "Admin created successfully",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const email = sanitizeInput(req.body.email).toLowerCase();
        const password = sanitizeInput(req.body.password);

        if (!email) {
            const error = new Error("Email is required");
            error.status = 400;
            throw error;
        }

        if (!password) {
            const error = new Error("Password is required");
            error.status = 400;
            throw error;
        }

        const user = await User.findOne({email}).select("+password");

        if (!user) {
            const error = new Error("Invalid email or password");
            error.status = 401;
            throw error;
        }

        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
            const error = new Error("Invalid password");
            error.status = 401;
            throw error;
        }

        if (user.isActive === false) {
            const error = new Error("Your account has been deactivated. Please contact support.");
            error.status = 403;
            throw error;
        }

        if (!process.env.JWT_SECRET) {
            const error = new Error("JWT_SECRET is not configured");
            error.status = 500;
            throw error;
        }



        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "user",
            },
        });
    } catch (error) {
        next(error);
    }
};

// get all users for assignment and management
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, "name email role createdAt").sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        next(error);
    }
};
