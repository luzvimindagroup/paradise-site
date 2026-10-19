import "server-only";
import { KLAVIYO_SOURCE_LABEL } from "@/config/signup";
import { syncProfile } from "@/lib/generic/klaviyo";

/** The subscriber columns Klaviyo gets. Shared by the signup and by the admin "retry" button. */
export type SubscriberForKlaviyo = {
  email: string; zip: string; language: string; language_assumed: boolean;
  source_slug: string | null; page_url: string | null; referrer: string | null;
  utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_content: string | null;
};
export const KLAVIYO_COLUMNS =
  "id, email, zip, language, language_assumed, source_slug, page_url, referrer, utm_source, utm_medium, utm_campaign, utm_content";

export async function syncSubscriber(s: SubscriberForKlaviyo): Promise<void> {
  await syncProfile({
    email: s.email,
    zip: s.zip,
    source: KLAVIYO_SOURCE_LABEL,
    properties: {
      language: s.language,
      language_assumed: s.language_assumed,
      signup_source: s.source_slug,
      signup_page: s.page_url,
      referrer: s.referrer,
      utm_source: s.utm_source,
      utm_medium: s.utm_medium,
      utm_campaign: s.utm_campaign,
      utm_content: s.utm_content,
    },
  });
}
