import { Router } from 'express';

const router = Router();

// Placeholder agent routes
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Agent routes placeholder',
  });
});

export default router;