const fs = require("fs");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, ".env") });

console.log("__dirname =", __dirname);
console.log(".env exists =", fs.existsSync(path.join(__dirname, ".env")));
console.log("MONGO_URI =", process.env.MONGO_URI);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.log("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
    email: String,
    mobile: String,
    role: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const resultSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    className: {
        type: String,
        required: true
    },
    scores: {
        type: Object,
        required: true
    },
    correctQs: {
        type: Object,
        required: true
    },
    totalQs: {
        type: Object,
        required: true
    },
    overallPercent: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Result = mongoose.model("Result", resultSchema);

const User = mongoose.model("User", userSchema);
app.post("/save-result", async (req, res) => {
    try {

        // 👇 ADD HERE
        console.log("🔥 RESULT ROUTE HIT");
        console.log("RESULT BODY:", req.body);

        const {
            email,
            studentName,
            className,
            scores,
            correctQs,
            totalQs,
            overallPercent
        } = req.body;

        if (!email || !studentName || !className || !scores || !correctQs || !totalQs) {
            return res.status(400).json({
                success: false,
                message: "Missing fields"
            });
        }

        const newResult = new Result({
            email,
            studentName,
            className,
            scores,
            correctQs,
            totalQs,
            overallPercent
        });

        await newResult.save();

        console.log("✅ Saved result:", newResult);

        res.json({ success: true });

    } catch (err) {
        console.log("❌ ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});
app.post("/login", async (req, res) => {
    try {
        const { email, mobile, role } = req.body;

        console.log("BODY RECEIVED:", req.body);

        if (!email || !mobile) {
            return res.status(400).json({
                success: false,
                message: "Fill all fields"
            });
        }

        const newUser = new User({
            email,
            mobile,
            role
        });

        await newUser.save();   // ✅ REAL SAVE

        console.log("✅ Saved user:", newUser);

        res.json({ success: true });

    } catch (err) {
        console.log("❌ ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Could not fetch users"
        });
    }
});

app.listen(5000, () => {
    console.log("Server running at http://localhost:5000");
});