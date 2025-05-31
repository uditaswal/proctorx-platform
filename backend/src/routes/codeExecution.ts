import { Router, Request, Response } from 'express';
import { submitCode } from '../utils/judge0';
import { verifyUser } from '../middleware/auth';

const router = Router();

router.post('/', verifyUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const { source_code, language_id, stdin } = req.body;

    if (!source_code || !language_id) {
      res.status(400).json({ error: 'source_code and language_id are required' });
      return;
    }

    const result = await submitCode(source_code, language_id, stdin || '');
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      message: 'Code execution failed',
      error: (err as Error).message,
    });
  }
});

export default router;
