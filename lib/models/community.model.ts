import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    image: String,
    bio: String,
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    threads:[
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Thread',
        }
    ],
    members: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
    ],
})

const Community = new mongoose.models.Community || mongoose.model("Community", CommunitySchema);

export default Community;