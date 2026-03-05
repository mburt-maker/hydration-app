import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    hydration_goal_oz: req.user.hydration_goal_oz,
    created_at: req.user.created_at
  });
});

// Update user profile
router.patch('/me', authenticate, async (req, res) => {
  const { name, hydration_goal_oz } = req.body;
  const updates = {};

  if (name !== undefined) {
    updates.name = name;
  }

  if (hydration_goal_oz !== undefined) {
    if (hydration_goal_oz < 1 || hydration_goal_oz > 300) {
      return res.status(400).json({ error: 'Hydration goal must be between 1 and 300 oz' });
    }
    updates.hydration_goal_oz = hydration_goal_oz;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid updates provided' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      hydration_goal_oz: user.hydration_goal_oz
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Complete onboarding
router.post('/onboarding', authenticate, async (req, res) => {
  const { name, hydration_goal_oz } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        name: name || null,
        hydration_goal_oz: hydration_goal_oz || 64
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      hydration_goal_oz: user.hydration_goal_oz
    });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

export default router;
