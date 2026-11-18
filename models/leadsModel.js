import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Lead name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
        },
        status: {
            type: String,
            enum: ["New", "Contacted", "In Progress", "Qualified", "Won", "Lost"],
            default: "New",
        },
        leadType: {
            type: String,
            enum: ["Inbound", "Outbound", "Referral", "Partner"],
            default: "Inbound",
        },
        dueDate: {
            type: String,
            default: "",
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "Assigned user is required"],
        },

        company: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
        },
        communication: {
            type: String,
            enum: ["Call", "Message", "Mail"],
            default: "Call",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

leadSchema.pre(/^find/, function () {
    this.where({ isDeleted: { $ne: true } });
});

leadSchema.pre("countDocuments", function () {
    this.where({ isDeleted: { $ne: true } });
});

const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);

export default Lead;
