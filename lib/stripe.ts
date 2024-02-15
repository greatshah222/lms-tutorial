import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
	apiVersion: "2023-10-16",
	typescript: true,
});
// stripe listen --forward-to localhost:3000/api/webhook
