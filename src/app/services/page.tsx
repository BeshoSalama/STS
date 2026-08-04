import { ServiceCards } from "@/components/sections/ServiceCards";
import { getServices } from "@/lib/content/services";

export const revalidate = 3600;

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <section className="services-page relative overflow-hidden pb-12 pt-36 sm:pt-44">
      <div className="container">
        <div className="services-page-heading">
          <p className="services-page-eyebrow">Growth systems built around your goals</p>
          <h1>
            <span>Our</span>
            <span>Services</span>
          </h1>
          <p>We build scalable growth systems for modern brands.</p>
        </div>
      </div>

      <ServiceCards services={services} />
    </section>
  );
}
