import { Router } from 'express';
import { submitCode } from '../utils/judge0';
import { verifyUser } from '../middleware/auth';

const router = Router();

router.post('/', verifyUser, async (req, res) => {
  const { source_code, language_id, stdin } = req.body;
  try {
    const result = await submitCode(source_code, language_id, stdin);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Code execution failed', error: err });
  }
});

export default router;
