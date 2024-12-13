import mongoose from "mongoose";
import { Children } from "react";

const ThreadSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    community: {
        type: mongoose.Schema.ObjectId,
        ref: "Community",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    parentId: String,
    children: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        }
    ]
})

const Thread = mongoose.models.Thread || mongoose.model("Thread", ThreadSchema);

export default Thread;