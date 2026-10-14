import "server-only";

const API = "https://a.klaviyo.com/api";
const REVISION = "2024-10-15";

export type KlaviyoProfile = {
  email: string;
  zip: string;
  properties: Record<string, string | string[] | boolean | null>;
};

function headers() {
  return {
    Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_API_KEY}`,
    revision: REVISION,
    accept: "application/vnd.api+json",
    "content-type": "application/vnd.api+json",
  };
}

export const klaviyoConfigured = () =>
  Boolean(process.env.KLAVIYO_PRIVATE_API_KEY && process.env.KLAVIYO_LIST_ID);

/** Create or update the profile, then subscribe it to the list. Throws on failure; callers must not log the error body (it can echo the email). */
export async function syncProfile(p: KlaviyoProfile): Promise<void> {
  const upsert = await fetch(`${API}/profile-import/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: { type: "profile", attributes: { email: p.email, location: { zip: p.zip }, properties: p.properties } },
    }),
  });
  if (!upsert.ok) throw new Error(`klaviyo profile ${upsert.status}`);

  const sub = await fetch(`${API}/profile-subscription-bulk-create-jobs/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          custom_source: "Paradise Sessions website",
          profiles: {
            data: [{
              type: "profile",
              attributes: {
                email: p.email,
                // Klaviyo stamps consent time itself (consented_at is only allowed on historical imports). Our own copy is in subscribers.consent_at.
                subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
              },
            }],
          },
        },
        relationships: { list: { data: { type: "list", id: process.env.KLAVIYO_LIST_ID } } },
      },
    }),
  });
  if (!sub.ok) throw new Error(`klaviyo subscribe ${sub.status}`);
}

/** Update profile properties only (used when /welcome answers come in). */
export async function updateProperties(email: string, properties: KlaviyoProfile["properties"]): Promise<void> {
  const res = await fetch(`${API}/profile-import/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ data: { type: "profile", attributes: { email, properties } } }),
  });
  if (!res.ok) throw new Error(`klaviyo update ${res.status}`);
}
