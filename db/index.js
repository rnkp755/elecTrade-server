import mongoose from "mongoose";

const connectToMongo = async () => {
      try {
            const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
            console.log("Connected to MongoDB !!", connectionInstance.connection.host);
      }
      catch (error) {
            console.log("MongoDB connection Failed xyz", error);
            process.exit(1);
      }
}

export default connectToMongo;