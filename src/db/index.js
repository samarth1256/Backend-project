import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import express from "express";

const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGOOSE connection Failed ",error)
        process.exit(1)
    }
}

export default connectDB