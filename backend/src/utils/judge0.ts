import axios from 'axios';

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

export interface CodeExecutionResult {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  status?: {
    id: number;
    description: string;
  };
  time?: string;
  memory?: number;
}

export const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  csharp: 51,
  go: 60,
  rust: 73,
  typescript: 74,
};

export const submitCode = async (
  code: string,
  languageId: number,
  input?: string
): Promise<CodeExecutionResult> => {
  try {
    // Submit code for execution
    const submissionResponse = await axios.post(
      `${JUDGE0_URL}/submissions`,
      {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: input ? Buffer.from(input).toString('base64') : undefined,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
      }
    );

    const token = submissionResponse.data.token;

    // Poll for result
    let result;
    let attempts = 0;
    const maxAttempts = 20;

    do {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const resultResponse = await axios.get(
        `${JUDGE0_URL}/submissions/${token}`,
        {
          headers: {
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        }
      );

      result = resultResponse.data;
      attempts++;
    } while (result.status?.id <= 2 && attempts < maxAttempts); // Status 1 = In Queue, 2 = Processing

    // Decode base64 outputs
    if (result.stdout) {
      result.stdout = Buffer.from(result.stdout, 'base64').toString();
    }
    if (result.stderr) {
      result.stderr = Buffer.from(result.stderr, 'base64').toString();
    }
    if (result.compile_output) {
      result.compile_output = Buffer.from(result.compile_output, 'base64').toString();
    }

    return result;
  } catch (error) {
    console.error('Judge0 execution error:', error);
    throw new Error('Code execution failed');
  }
};

export const getLanguages = async () => {
  try {
    const response = await axios.get(`${JUDGE0_URL}/languages`, {
      headers: {
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch languages:', error);
    return [];
  }
};

