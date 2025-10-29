import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import db from "../libs/prisma-client";
import { stripe } from "../libs/stripe";
import { Decimal } from "@prisma/client/runtime/library";

// router.post('/webhooks', express.raw({ type: 'application/json' }), stripeWebhookController);

export async function stripeWebhookController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const body = req.body.toString();
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("WEBHOOK_ERROR: ", err);
    return res.status(400).send(`WEBHOOK_ERROR: ${err.message}`);
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const address = session?.customer_details?.address;

  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ];

  const addressString = addressComponents.filter(Boolean).join(", ");

  if (event.type === "checkout.session.completed") {
    try {
      await db.order.update({
        where: {
          id: session?.metadata?.orderId,
        },
        data: {
          isPaid: true,
          address: addressString,
          phone: session?.customer_details?.phone || "",
        },
        include: {
          orderItems: true,
        },
      });
    } catch (dbError) {
      console.error("DATABASE_UPDATE_ERROR: ", dbError);
    }
  }

  return res.status(200).json({ received: true });
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CheckoutItem {
  productId: string;
  quantity: number;
}

export async function optionsCheckoutController(req: Request, res: Response) {
  return res.status(200).set(corsHeaders).json({});
}

export async function stripeCheckoutController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { storeId } = req.params;
    const { items }: { items: CheckoutItem[] } = req.body;

    if (!storeId) {
      return res.status(400).json({ message: "Store ID is required!" });
    }

    if (!items || !items.length) {
      return res.status(400).json({ message: "Product IDs are required!" });
    }

    const quantityMap: Record<string, number> = {};

    const productIds = items.map((item) => {
      quantityMap[item.productId] = item.quantity;
      return item.productId;
    });

    const products = await db.product.findMany({
      where: {
        storeId,
        id: {
          in: productIds,
        },
      },
    });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    products.forEach((prd) => {
      const priceInNumber = (prd.price as unknown as Decimal).toNumber();

      line_items.push({
        quantity: quantityMap[prd.id],
        price_data: {
          currency: "USD",
          product_data: {
            name: prd.name,
          },
          unit_amount: Math.round(priceInNumber * 100),
        },
      });
    });

    // --- Order Creation ---
    const order = await db.order.create({
      data: {
        storeId,
        isPaid: false,
        orderItems: {
          create: productIds.map((productId: string) => ({
            quantity: Number(quantityMap[productId]),
            product: {
              connect: {
                id: productId,
              },
            },
          })),
        },
      },
    });

    // --- Stripe Session Creation ---
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
      cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
      metadata: {
        orderId: order.id,
      },
    });

    return res.status(200).set(corsHeaders).json({ url: session.url });
  } catch (error) {
    console.error("[ERROR_POST] [STRIPE_CHECKOUT_CONTROLLER]", error);
    next(error);
  }
}
