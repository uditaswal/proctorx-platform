import axios from 'axios';

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// ---------------------------
// Interfaces & Constants
// ---------------------------

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

interface SubmissionResponse {
  token: string;
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

// ---------------------------
// Submit Code Function
// ---------------------------

export const submitCode = async (
  code: string,
  languageId: number,
  input?: string
): Promise<CodeExecutionResult> => {
  try {
    const submissionResponse = await axios.post<SubmissionResponse>(
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

    let result: CodeExecutionResult | undefined;
    let attempts = 0;
    const maxAttempts = 20;

    do {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const resultResponse = await axios.get<CodeExecutionResult>(
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

      // Exit loop only if status and status.id are defined and status.id > 2
      if (!result.status || typeof result.status.id !== 'number') {
        break;
      }
    } while (result.status.id <= 2 && attempts < maxAttempts);

    // Decode base64 outputs safely
    if (result?.stdout) {
      result.stdout = Buffer.from(result.stdout, 'base64').toString();
    }
    if (result?.stderr) {
      result.stderr = Buffer.from(result.stderr, 'base64').toString();
    }
    if (result?.compile_output) {
      result.compile_output = Buffer.from(result.compile_output, 'base64').toString();
    }

    return result!;
  } catch (error) {
    console.error('Judge0 execution error:', error);
    throw new Error('Code execution failed');
  }
};

// ---------------------------
// Get Languages Function
// ---------------------------

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
