export function PricingBackdrop() {
  return (
    <>
      <div className="pricing-orbit pricing-orbit--left" aria-hidden="true">
        <div className="pricing-mini-dashboard">
          <span>Total Revenue</span>
          <strong>+275%</strong>
          <i />
          <span>Total Reach</span>
          <strong>12.8M</strong>
          <i />
          <span>Leads Generated</span>
          <strong>35.7K</strong>
        </div>
      </div>
      <div className="pricing-orbit pricing-orbit--right" aria-hidden="true">
        <div className="pricing-hologram">
          <span>Ads</span>
          <span>SEO</span>
          <span>CRM</span>
          <span>UX</span>
        </div>
      </div>
    </>
  );
}
