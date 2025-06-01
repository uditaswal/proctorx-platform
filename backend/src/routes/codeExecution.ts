import { Router, Request, Response } from 'express';
import { submitCode } from '../utils/judge0';
import { authenticate } from '../middleware/auth';
// 
const router = Router();

router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { source_code, language_id, stdin = '' } = req.body;

    if (!source_code || !language_id) {
      res.status(400).json({ error: 'source_code and language_id are required' });
      return;
    }

    const result = await submitCode(source_code, language_id, stdin);

    res.status(200).json({
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? result.compile_output ?? '',
      status: result.status?.description ?? 'Unknown',
    });
  } catch (err) {
    console.error('[Execution Error]', err);
    res.status(500).json({
      error: 'Code execution failed via Judge0',
      details: (err as Error).message,
    });
  }
});

export default router;
