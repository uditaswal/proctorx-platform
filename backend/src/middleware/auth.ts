import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export const verifyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Unauthorized: No token' });
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(403).json({ message: 'Invalid token' });
      return;
    }

    // Attach user to request object for use in routes
    (req as any).user = user;
    next();

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
};
