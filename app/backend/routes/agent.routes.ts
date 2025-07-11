import { Router } from 'express';
import { agentController } from '../controllers/agent.controller';

const router = Router();

router.get('/', agentController.list);
router.get('/:id', agentController.get);
router.post('/', agentController.create);
router.put('/:id', agentController.update);
router.delete('/:id', agentController.delete);

export default router;
