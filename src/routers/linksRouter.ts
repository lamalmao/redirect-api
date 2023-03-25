import { Router } from 'express';
import authController from '../controllers/authController.js';
import createLinkController from '../controllers/linksControllers/createLinkController.js';

const linksRouter = Router();

linksRouter.use(authController);
linksRouter.put('/', createLinkController);

export default linksRouter;
