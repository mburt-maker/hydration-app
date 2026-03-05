import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { beverageCategories, getBeverageList } from '../data/beverages.js';

const router = express.Router();

// Get beverage categories
router.get('/categories', (req, res) => {
  res.json(getBeverageList());
});

// Log a beverage
router.post('/log', authenticate, async (req, res) => {
  const { beverage_type, beverage_subtype, volume_oz, logged_at } = req.body;

  // Validate beverage type
  if (!beverageCategories[beverage_type]) {
    return res.status(400).json({ error: 'Invalid beverage type' });
  }

  // Validate subtype
  const category = beverageCategories[beverage_type];
  if (!category.subtypes.includes(beverage_subtype)) {
    return res.status(400).json({ error: 'Invalid beverage subtype' });
  }

  // Validate volume
  if (!volume_oz || volume_oz <= 0 || volume_oz > 128) {
    return res.status(400).json({ error: 'Volume must be between 1 and 128 oz' });
  }

  try {
    const { data: log, error } = await supabase
      .from('beverage_logs')
      .insert({
        user_id: req.user.id,
        beverage_type,
        beverage_subtype,
        volume_oz,
        logged_at: logged_at || new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(log);
  } catch (err) {
    console.error('Log beverage error:', err);
    res.status(500).json({ error: 'Failed to log beverage' });
  }
});

// Get today's logs (based on user's timezone)
router.get('/today', authenticate, async (req, res) => {
  const { timezone } = req.query;

  try {
    // Calculate today's date range in user's timezone
    const now = new Date();
    const userDate = new Date(now.toLocaleString('en-US', { timeZone: timezone || 'UTC' }));
    const startOfDay = new Date(userDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(userDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: logs, error } = await supabase
      .from('beverage_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('logged_at', startOfDay.toISOString())
      .lte('logged_at', endOfDay.toISOString())
      .order('logged_at', { ascending: false });

    if (error) throw error;

    const totalOz = logs.reduce((sum, log) => sum + log.volume_oz, 0);

    res.json({
      logs,
      totalOz,
      goal: req.user.hydration_goal_oz,
      percentage: Math.min(100, Math.round((totalOz / req.user.hydration_goal_oz) * 100))
    });
  } catch (err) {
    console.error('Get today logs error:', err);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// Update a log (today only)
router.patch('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { beverage_type, beverage_subtype, volume_oz } = req.body;
  const { timezone } = req.query;

  try {
    // Verify ownership and that it's today's log
    const { data: existingLog } = await supabase
      .from('beverage_logs')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!existingLog) {
      return res.status(404).json({ error: 'Log not found' });
    }

    // Check if log is from today
    const now = new Date();
    const userDate = new Date(now.toLocaleString('en-US', { timeZone: timezone || 'UTC' }));
    const logDate = new Date(new Date(existingLog.logged_at).toLocaleString('en-US', { timeZone: timezone || 'UTC' }));

    if (userDate.toDateString() !== logDate.toDateString()) {
      return res.status(400).json({ error: 'Can only edit today\'s logs' });
    }

    const updates = {};
    if (beverage_type && beverageCategories[beverage_type]) {
      updates.beverage_type = beverage_type;
    }
    if (beverage_subtype) {
      updates.beverage_subtype = beverage_subtype;
    }
    if (volume_oz && volume_oz > 0 && volume_oz <= 128) {
      updates.volume_oz = volume_oz;
    }

    const { data: log, error } = await supabase
      .from('beverage_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(log);
  } catch (err) {
    console.error('Update log error:', err);
    res.status(500).json({ error: 'Failed to update log' });
  }
});

// Delete a log (today only)
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { timezone } = req.query;

  try {
    // Verify ownership and that it's today's log
    const { data: existingLog } = await supabase
      .from('beverage_logs')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!existingLog) {
      return res.status(404).json({ error: 'Log not found' });
    }

    // Check if log is from today
    const now = new Date();
    const userDate = new Date(now.toLocaleString('en-US', { timeZone: timezone || 'UTC' }));
    const logDate = new Date(new Date(existingLog.logged_at).toLocaleString('en-US', { timeZone: timezone || 'UTC' }));

    if (userDate.toDateString() !== logDate.toDateString()) {
      return res.status(400).json({ error: 'Can only delete today\'s logs' });
    }

    const { error } = await supabase
      .from('beverage_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Log deleted' });
  } catch (err) {
    console.error('Delete log error:', err);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

export default router;
