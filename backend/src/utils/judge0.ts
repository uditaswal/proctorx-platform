import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
const API_KEY = process.env.JUDGE0_API_KEY!;
const API_HOST = 'judge0-ce.p.rapidapi.com';

// ✅ Exported type
export interface Judge0Result {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  status: { id: number; description: string };
}

// ✅ Type-safe return
export const submitCode = async (
  source_code: string,
  language_id: number,
  stdin: string = ''
): Promise<Judge0Result> => {
  try {
    const response = await axios.post(
      JUDGE0_URL,
      {
        source_code,
        language_id,
        stdin,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST,
        },
        timeout: 10000,
      }
    );

    return response.data as Judge0Result; // ✅ assert type
  } catch (error: any) {
    console.error('[Judge0 Error]', error?.response?.data || error.message);
    throw new Error('Code execution failed via Judge0 API');
  }
};
