import { raw, Router } from "express";
import { stripeWebhookController } from "../controllers/stripe.controller";

const webhookRouter = Router();

webhookRouter.post('/', raw({ type: 'application/json' }), stripeWebhookController);

export default webhookRouter;