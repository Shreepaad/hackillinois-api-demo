import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("Connected to MongoDB.");
  })
  .catch((error) => {
    console.error("[ERROR] Could not connect to MongoDB:", error);
  });

// test route 
app.get('/', (req: Request, res: Response) => {
    res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
