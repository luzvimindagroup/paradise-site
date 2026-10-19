import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

// Shared frame for the inner public pages. The home page renders its own header (no wordmark),
// and landing pages and admin are outside this folder, so they get no header at all.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
