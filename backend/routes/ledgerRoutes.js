import express from "express";
import Ledger from "../models/Ledger.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const entries = await Ledger.find({ user: req.userId }).sort({
      createdAt: -1,
    });

    res.json(entries);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch ledger entries",
    });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const entry = await Ledger.create({
      user: req.userId,
      ...req.body,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({
      error: "Failed to create ledger entry",
    });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const entry = await Ledger.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!entry) {
      return res.status(404).json({
        error: "Entry not found",
      });
    }

    res.json({
      message: "Entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete ledger entry",
    });
  }
});

export default router;