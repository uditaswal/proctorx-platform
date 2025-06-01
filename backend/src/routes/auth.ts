import express from 'express';
import { register, login, logout } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import supabase from '../utils/supabaseClient';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({ user: { ...user, profile } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
