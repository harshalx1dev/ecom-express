import { Router } from "express";
import { loginRouteController, registerRouteController, sessionRouteController, usersRouteController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth";

const authRouter = Router();

authRouter.get('/users', authenticate, usersRouteController);

authRouter.get('/session', authenticate, sessionRouteController);

authRouter.post('/register', registerRouteController);

authRouter.post('/login', loginRouteController);

export default authRouter;