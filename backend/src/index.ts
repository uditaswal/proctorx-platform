import express from 'express';
import dotenv from "dotenv";
dotenv.config();

import cors from 'cors';
import authRoutes from './routes/auth';
import examRoutes from './routes/exam';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ProctorX backend is running!");
});


app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

