import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import volunteerRoutes from './routes/volunteers';
import shiftRoutes from './routes/shifts';

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

app.use('/volunteers', volunteerRoutes);
app.use('/shifts', shiftRoutes);

// error handler
// express forwards rejected promises from async routes here
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: 'Invalid id' });
  } else if (err.code === 11000) {
    res.status(409).json({ message: 'Email already registered' });
  } else {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});