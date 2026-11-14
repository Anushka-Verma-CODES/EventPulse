
import { getAuthHeaders } from "../../../lib/authApi";
import { API_BASE_URL } from "../../../lib/apiConfig";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message;

    throw new Error(
      message || `Request failed (${response.status})`,
    );
  }

  return data as T;
}

export async function getPushPublicKey(): Promise<string> {
  const result = await request<{ publicKey: string }>(
    "/notifications/push/public-key",
  );

  if (!result.publicKey) {
    throw new Error("Push notification public key is missing.");
  }

  return result.publicKey;
}

export async function savePushSubscription(
  subscription: PushSubscription,
): Promise<{ message: string }> {
  const subscriptionData = subscription.toJSON();

  const endpoint = subscriptionData.endpoint;
  const p256dh = subscriptionData.keys?.p256dh;
  const auth = subscriptionData.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    throw new Error("Invalid browser push subscription.");
  }

  return request<{ message: string }>(
    "/notifications/push/subscribe",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint,
        keys: {
          p256dh,
          auth,
        },
      }),
    },
  );
}

export async function removePushSubscription(
  endpoint: string,
): Promise<{ message: string }> {
  return request<{ message: string }>(
    "/notifications/push/unsubscribe",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint }),
    },
  );
}
