import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get daily stats for a date range
router.get('/history', authenticate, async (req, res) => {
  const { period, timezone } = req.query;

  try {
    const now = new Date();
    const userNow = new Date(now.toLocaleString('en-US', { timeZone: timezone || 'UTC' }));

    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(userNow);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(userNow);
        startDate.setDate(startDate.getDate() - 30);
        break;
      default: // day
        startDate = new Date(userNow);
        startDate.setHours(0, 0, 0, 0);
    }

    const { data: logs, error } = await supabase
      .from('beverage_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('logged_at', startDate.toISOString())
      .order('logged_at', { ascending: true });

    if (error) throw error;

    // Group logs by date
    const dailyStats = {};
    logs.forEach(log => {
      const logDate = new Date(log.logged_at).toLocaleDateString('en-US', { timeZone: timezone || 'UTC' });
      if (!dailyStats[logDate]) {
        dailyStats[logDate] = {
          date: logDate,
          totalOz: 0,
          logs: [],
          byCategory: {}
        };
      }
      dailyStats[logDate].totalOz += log.volume_oz;
      dailyStats[logDate].logs.push(log);

      if (!dailyStats[logDate].byCategory[log.beverage_type]) {
        dailyStats[logDate].byCategory[log.beverage_type] = 0;
      }
      dailyStats[logDate].byCategory[log.beverage_type] += log.volume_oz;
    });

    // Convert to array and add goal achievement
    const goal = req.user.hydration_goal_oz;
    const statsArray = Object.values(dailyStats).map(day => ({
      ...day,
      goal,
      percentage: Math.min(100, Math.round((day.totalOz / goal) * 100)),
      goalMet: day.totalOz >= goal
    }));

    res.json({
      period,
      goal,
      stats: statsArray,
      summary: {
        totalDays: statsArray.length,
        daysGoalMet: statsArray.filter(d => d.goalMet).length,
        averageOz: statsArray.length > 0
          ? Math.round(statsArray.reduce((sum, d) => sum + d.totalOz, 0) / statsArray.length)
          : 0
      }
    });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

export default router;
