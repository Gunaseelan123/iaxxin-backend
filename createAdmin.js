import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

import mongoose from "mongoose";
import User from "./models/userModel.js"



const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected");

        const existingAdmin = await User.findOne({
            $or: [
                { email: "ravi@gmail.com" },
            ],
        });

        if (existingAdmin) {
            console.log("admin already exists");
            process.exit(0);
        }


        await User.create({
            name: "ravi",
            email: "ravi@gmail.com",
            password: "12345678",
            role: "admin",
        });


        console.log("admin created successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};



createAdmin();