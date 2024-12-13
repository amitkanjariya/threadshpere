import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
    mongoose.set("strictQuery", true);
    if(!process.env.MONGODB_URI){
        return console.log("Missing Mongodb Uri");
    }
    if(isConnected){
        console.log("MongoDB connection already established successfully");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected=true;
        console.log("MongoDB is connected successfully.");
    } catch (error) {
        console.log("Getting error while connecting error : ", error);
    }
}