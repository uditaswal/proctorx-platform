import { RequestHandler } from 'express';
import supabase from '../utils/supabaseClient';

export const register: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(200).json({ message: 'User registered', data });
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    res.status(401).json({ error: error.message });
    return;
  }

  res.status(200).json({ message: 'Login successful', data });
};
