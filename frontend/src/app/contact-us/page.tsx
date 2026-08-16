import { ContactPanel } from "@/components/sections/ContactPanel";

export const metadata = {
  title: "Free Consultation | STS Agency",
  description: "Book a free consultation with the STS Agency growth team.",
};

export default function ContactUsPage() {
  return (
    <div className="relative overflow-hidden pt-40 sm:pt-48">
      <ContactPanel />
    </div>
  );
}
