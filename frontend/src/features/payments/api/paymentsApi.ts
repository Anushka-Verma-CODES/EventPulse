
const API_BASE_URL = "http://localhost:3000";

export type CreatePaymentOrderResponse = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  eventName: string;
};

export type VerifyPaymentPayload = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type VerifyPaymentResponse = {
  message: string;
  registrationId?: string;
};

function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem("eventpulse_access_token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

async function request<T>(
  endpoint: string,
  body: unknown,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ??
        "Something went wrong while processing your payment.",
    );
  }

  return data as T;
}

export function createPaymentOrder(
  eventId: string,
): Promise<CreatePaymentOrderResponse> {
  return request<CreatePaymentOrderResponse>(
    "/payments/orders",
    { eventId },
  );
}

export function verifyPayment(
  payload: VerifyPaymentPayload,
): Promise<VerifyPaymentResponse> {
  return request<VerifyPaymentResponse>(
    "/payments/verify",
    payload,
  );
}
