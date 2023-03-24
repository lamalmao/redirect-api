import { Router } from 'express';
import signupController from '../controllers/signupController.js';
import { verifyController } from '../controllers/verifyController.js';

const mainRouter = Router();
mainRouter.use('/signup', signupController);
mainRouter.post('/verify', verifyController);

export default mainRouter;
