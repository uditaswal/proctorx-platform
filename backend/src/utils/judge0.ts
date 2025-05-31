import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();


const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const API_KEY = process.env.JUDGE0_API_KEY!;

export const submitCode = async (source_code: string, language_id: number, stdin: string = '') => {
  const submission = await axios.post(JUDGE0_URL + '?base64_encoded=false&wait=true', {
    source_code,
    language_id,
    stdin
  }, {
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    },
  });

  return submission.data;
};
