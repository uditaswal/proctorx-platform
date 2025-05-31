import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
const API_KEY = process.env.JUDGE0_API_KEY!;
const API_HOST = 'judge0-ce.p.rapidapi.com';

/**
 * Submits code to Judge0 API for execution.
 * @param source_code - The code to execute
 * @param language_id - Language ID (e.g., 71 for Python, 63 for JS)
 * @param stdin - Optional standard input
 * @returns Output, status, and any stderr from Judge0
 */
export const submitCode = async (
  source_code: string,
  language_id: number,
  stdin: string = ''
): Promise<any> => {
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
        timeout: 10000, // optional: 10 second timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error('[Judge0 Error]', error);
    throw new Error('Code execution failed via Judge0 API');
  }
};
