"use client";

import type { CSSProperties } from "react";
import { Activity, Compass, LineChart, MessageSquareText, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/lib/animations";
import { Button } from "@/components/ui/Button";
import { services } from "@/lib/content/services";
import { cn } from "@/lib/cn";

const icons = {
  consulting: MessageSquareText,
  management: LineChart,
  strategy: Compass,
};

const chartHeights = [
  [24, 35, 30, 48, 58, 53, 72, 84],
  [20, 28, 42, 38, 56, 66, 76, 92],
  [32, 25, 46, 52, 47, 68, 80, 88],
];

export function ServiceCards() {
  const ref = useScrollReveal<HTMLDivElement>({ selector: "[data-reveal]", stagger: 0.14 });

  return (
    <div ref={ref} className="services-showcase container">
      {services.map((service, index) => {
        const Icon = icons[service.icon];
        const featured = index === 1;

        return (
          <article
            key={service.title}
            data-reveal
            className={cn("service-showcase-card service-motion group", featured && "service-showcase-card--featured")}
          >
            <div className="service-showcase-visual service-motion">
              <div className="service-visual-scan service-motion" />
              <div className="service-visual-head">
                <span className="service-visual-icon">
                  <Icon size={22} />
                </span>
                <span className="service-live-chip">
                  <Activity size={11} />
                  Live growth system
                </span>
              </div>

              <div className="service-dashboard">
                <div className="service-chart" aria-hidden="true">
                  {chartHeights[index].map((height, barIndex) => (
                    <span
                      key={`${service.icon}-${barIndex}`}
                      className="service-motion"
                      style={{ "--service-bar-height": `${height}%` } as CSSProperties}
                    />
                  ))}
                </div>
                <div className="service-dashboard-person service-motion" aria-hidden="true">
                  <span />
                </div>
                <div className="service-dashboard-stats" aria-hidden="true">
                  <span>+38%</span>
                  <span>04.8x</span>
                </div>
              </div>

              <div className="service-neural-trace" aria-hidden="true">
                <span className="service-motion" />
                <span className="service-motion" />
                <span className="service-motion" />
                <span className="service-motion" />
                <span className="service-motion" />
              </div>

              <div className="service-visual-copy">
                <span className="service-motion">
                  <Sparkles size={14} />
                </span>
                <div>
                  <p>{service.eyebrow}</p>
                  <strong>{service.title}</strong>
                </div>
              </div>
            </div>

            <div className="service-showcase-content">
              <p>{service.description}</p>
              <Button href="/contact" className="service-motion mt-6 w-full justify-center py-3.5">
                {service.cta}
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
