import express from 'express';
import dotenv from "dotenv";
dotenv.config();
import { errorHandler } from './middleware/errorHandler';

import questionRoutes from './routes/question';

import cors from 'cors';
import authRoutes from './routes/auth';
import examRoutes from './routes/exam';
import submissionRoutes from './routes/submissionRoutes';
import proctorRoutes from './routes/proctorRoutes';
import codeExecution from './routes/codeExecution';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(errorHandler);
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/execute-code', codeExecution);
app.use('/api/questions', questionRoutes);


app.use('/api/submissions', submissionRoutes);
app.use('/api/proctor', proctorRoutes);
app.use('/api/execute', codeExecution);


app.get("/", (req, res) => {
  res.send("ProctorX backend is running!");
});

console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log("Supabase Key exists:", !!process.env.SUPABASE_ANON_KEY);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

