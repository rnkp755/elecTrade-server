import dotenv from 'dotenv';
import connectToMongo from './db/index.js';
import app from './app.js';

dotenv.config({
      path: './.env'
});

const PORT = process.env.PORT || 5173;

(async () => {
      try {
            await connectToMongo();
            console.log('Connected to MongoDB successfully');

            app.listen(PORT, () => {
                  console.log(`Server is listening on PORT ${PORT}`);
            });

            app.on('error', (error) => {
                  console.error('Server error:', error);
                  // Handle server errors gracefully, e.g., notify or log
            });
      } catch (error) {
            console.error('Failed to connect to MongoDB:', error.message);
            process.exit(1); // Exit with failure if MongoDB connection fails
      }
})();
