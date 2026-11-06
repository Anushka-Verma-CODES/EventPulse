interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal: {
    ondismiss: () => void;
  };
  theme: {
    color: string;
  };
}

interface RazorpayCheckoutInstance {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: { error?: { description?: string } }) => void,
  ) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

export async function loadRazorpayCheckout(): Promise<void> {
  if (window.Razorpay) {
    return;
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        "script[data-razorpay-checkout]",
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Unable to load Razorpay Checkout.")),
          { once: true },
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.dataset.razorpayCheckout = "true";
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Unable to load Razorpay Checkout."));

      document.body.appendChild(script);
    }).catch((error: unknown) => {
      razorpayScriptPromise = null;
      throw error;
    });
  }

  await razorpayScriptPromise;

  if (!window.Razorpay) {
    throw new Error(
      "Razorpay Checkout is unavailable. Please refresh and try again.",
    );
  }
}
