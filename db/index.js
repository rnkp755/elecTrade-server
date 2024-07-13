import mongoose from 'mongoose';

const connectToMongo = async (retries = 2, wait = 5000) => {

      while (retries) {
            try {
                  const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
                  console.log("Connected to MongoDB!!", connectionInstance.connection.host);
                  return;
            } catch (error) {
                  console.error("MongoDB connection failed:", error.message);
                  retries -= 1;
                  console.log(`Retries left: ${retries}`);
                  if (retries === 0) {
                        process.exit(1); // Exit process with failure
                  }
                  await new Promise(res => setTimeout(res, wait)); // Wait before retrying
            }
      }
};

export default connectToMongo;
