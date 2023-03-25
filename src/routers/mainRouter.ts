import { Router } from 'express';
import signupController from '../controllers/signupController.js';
import { verifyController } from '../controllers/verifyController.js';
import linksRouter from './linksRouter.js';

const mainRouter = Router();
mainRouter.use('/signup', signupController);
mainRouter.post('/verify', verifyController);
mainRouter.use('/links', linksRouter);

export default mainRouter;
