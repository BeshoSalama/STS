"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Handshake,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { getProjectSlug } from "@/lib/content/projects";
import { useCountUp } from "@/lib/animations";
import type { ClientLogoImage } from "@/lib/content/clientLogos";
import type { ProjectItem, ValueProp } from "@/types/content";
import styles from "./ClientsHero.module.css";

const featureIcons = {
  target: Target,
  bulb: Lightbulb,
  chart: BarChart3,
  headset: Handshake,
};

const growthArrowPath =
  "M72 600 C315 604 520 590 710 552 C920 510 1112 430 1227 254 C1290 158 1326 20 1326 -24";

type ClientsHeroProps = {
  clientLogoImages: ClientLogoImage[];
  valueProps: ValueProp[];
  projects: ProjectItem[];
  heroStats: { growth: number; revenue: number; roi: number };
  clientStats: { happyClients: number; successfulProjects: number };
};

function Skyline() {
  return (
    <div className={styles.skyline} aria-hidden="true">
      <svg viewBox="0 0 1100 390" preserveAspectRatio="none">
        <defs>
          <linearGradient id="clients-city" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#a984e3" />
            <stop offset="1" stopColor="#341963" />
          </linearGradient>
          <linearGradient id="clients-city-dark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#8b5fd6" />
            <stop offset="1" stopColor="#2a1454" />
          </linearGradient>
          <filter id="clients-city-blur">
            <feGaussianBlur stdDeviation=".35" />
          </filter>
        </defs>
        <g filter="url(#clients-city-blur)">
          <path
            d="M0 390V300h30v-42h22v132h22V278h28v112h24V210h18v180h28V260h20v130h16V178h20v212h30V245h18v145h25V150h18v240h22V286h26v104h18V230h24v160h24V265h18v125h20V102h18v288h28V210h25v180h18V262h24v128h22V185h22v205h26V238h18v152h28V125h20v265h26V245h18v145h30V210h22v180h20V280h18v110h24V170h20v220h24V260h26v130h18V220h22v170h25V118h18v272h28V268h18v122h20V205h24v185h24V295h22v95h25V150h20v240h24V248h20v142h25V286h24v104h22V218h20v172h30V275h18v115h28V175h20v215h32V390Z"
            fill="url(#clients-city)"
          />
          <path
            d="M168 390V235h18v-42h12v42h20v155M410 390V165h18v-63h13v63h18v225M655 390V203h20v-78h14v78h19v187M930 390V184h18v-66h13v66h22v206"
            fill="url(#clients-city-dark)"
          />
          <g fill="#e7def9" opacity=".7">
            <rect className={styles.windowGlow} x="424" y="185" width="5" height="16" />
            <rect className={styles.windowGlow} x="443" y="215" width="5" height="16" />
            <rect className={styles.windowGlow} x="671" y="226" width="5" height="15" />
            <rect className={styles.windowGlow} x="690" y="255" width="5" height="15" />
            <rect className={styles.windowGlow} x="946" y="205" width="5" height="15" />
            <rect className={styles.windowGlow} x="965" y="236" width="5" height="15" />
          </g>
          <path
            d="M0 363 C180 350 330 370 500 356 C690 340 875 370 1100 350 V390H0Z"
            fill="#472280"
            opacity=".28"
          />
        </g>
      </svg>
    </div>
  );
}

function GrowthPanel({ growth }: { growth: number }) {
  const countRef = useCountUp({ end: growth, prefix: "+", suffix: "%", duration: 0.95 });

  return (
    <div className={`${styles.panel} ${styles.growthPanel}`}>
      <small>GROWTH</small>
      <strong>
        <span ref={countRef}>+0%</span>
      </strong>
      <svg viewBox="0 0 170 56" aria-hidden="true">
        <polyline
          points="2,48 24,37 44,40 64,24 86,31 108,18 131,26 166,3"
          fill="none"
          stroke="#cbb6f0"
          strokeWidth="3"
        />
        <g fill="#cbb6f0">
          <circle cx="24" cy="37" r="3" />
          <circle cx="64" cy="24" r="3" />
          <circle cx="108" cy="18" r="3" />
          <circle cx="166" cy="3" r="3" />
        </g>
      </svg>
    </div>
  );
}

function RevenuePanel({ revenue }: { revenue: number }) {
  const heights = [14, 24, 32, 43, 58, 72, 88];
  const countRef = useCountUp({ end: revenue, prefix: "+", suffix: "K", duration: 0.95 });

  return (
    <div className={`${styles.panel} ${styles.revenuePanel}`}>
      <small>REVENUE</small>
      <strong>
        <span ref={countRef}>+0K</span>
      </strong>
      <div className={styles.bars} aria-hidden="true">
        {heights.map((height, index) => (
          <span key={height} style={{ height: `${height}%` }} data-accent={index === heights.length - 1} />
        ))}
      </div>
    </div>
  );
}

function RoiPanel({ roi }: { roi: number }) {
  const countRef = useCountUp({ end: roi, decimals: 1, suffix: "X", duration: 0.95 });

  return (
    <div className={`${styles.panel} ${styles.roiPanel}`}>
      <div className={styles.ring}>
        <div>
          <span>ROI</span>
          <strong>
            <span ref={countRef}>0.0X</span>
          </strong>
        </div>
      </div>
    </div>
  );
}

export function ClientsHero({ clientLogoImages, valueProps, projects, heroStats, clientStats }: ClientsHeroProps) {
  const projectHrefByImage = new Map(projects.map((project) => [project.image, `/projects/${project.slug || getProjectSlug(project.name)}`]));
  const projectHrefBySlug = new Map(projects.map((project) => [getProjectSlug(project.name), `/projects/${project.slug || getProjectSlug(project.name)}`]));
  const stageRef = useRef<HTMLDivElement | null>(null);
  const arrowSvgRef = useRef<SVGSVGElement | null>(null);
  const arrowPathRef = useRef<SVGPathElement | null>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const pauseCountRef = useRef(0);
  const pauseStartedRef = useRef(0);
  const pausedDurationRef = useRef(0);

  function pauseMotion() {
    if (pauseCountRef.current === 0) {
      pauseStartedRef.current = performance.now();
    }
    pauseCountRef.current += 1;
  }

  function resumeMotion() {
    pauseCountRef.current = Math.max(0, pauseCountRef.current - 1);
    if (pauseCountRef.current === 0 && pauseStartedRef.current) {
      pausedDurationRef.current += performance.now() - pauseStartedRef.current;
      pauseStartedRef.current = 0;
    }
  }

  function getLogoProjectHref(file: string, name: string) {
    return projectHrefByImage.get(file) ?? projectHrefBySlug.get(getProjectSlug(name)) ?? "/projects";
  }

  useEffect(() => {
    const stage = stageRef.current;
    const arrowSvg = arrowSvgRef.current;
    const arrowPath = arrowPathRef.current;
    const cards = cardRefs.current.filter((card): card is HTMLAnchorElement => Boolean(card));
    if (!stage || !arrowSvg || !arrowPath || cards.length === 0) return;

    const desktopLayout = window.matchMedia("(min-width: 1024px)").matches;
    if (!desktopLayout) return;

    const startT = 0.035;
    const endT = 0.97;
    const travel = endT - startT;
    const visibleSlots = 10;
    const spacing = travel / visibleSlots;
    const fullTrack = spacing * cards.length;
    const cycleMs = 32000;
    const startedAt = performance.now();
    let raf = 0;
    let lastProgress = 0;

    function metrics() {
      const svgRect = arrowSvg!.getBoundingClientRect();
      const viewBox = arrowSvg!.viewBox.baseVal;
      return {
        originX: 0,
        originY: 0,
        scaleX: svgRect.width / viewBox.width,
        scaleY: svgRect.height / viewBox.height,
        total: arrowPath!.getTotalLength(),
      };
    }

    let currentMetrics = metrics();

    function railPoint(t: number, cardHeight: number) {
      const length = currentMetrics.total * t;
      const point = arrowPath!.getPointAtLength(length);
      return {
        x: currentMetrics.originX + point.x * currentMetrics.scaleX,
        y: currentMetrics.originY + point.y * currentMetrics.scaleY - cardHeight / 2 - 6,
      };
    }

    function edgeOpacity(local: number) {
      const fade = 0.035;
      if (local < fade) return local / fade;
      if (local > travel - fade) return (travel - local) / fade;
      return 1;
    }

    function placeCards(progress: number) {
      cards.forEach((card, index) => {
        const local = (progress * fullTrack + index * spacing) % fullTrack;
        if (local >= travel) {
          card.style.opacity = "0";
          card.style.pointerEvents = "none";
          card.tabIndex = -1;
          return;
        }

        const point = railPoint(startT + local, card.offsetHeight);
        card.style.left = `${point.x - card.offsetWidth / 2}px`;
        card.style.top = `${point.y - card.offsetHeight / 2}px`;
        card.style.opacity = String(Math.max(0, Math.min(1, edgeOpacity(local))));
        card.style.pointerEvents = "auto";
        card.tabIndex = 0;
      });
    }

    function animate(now: number) {
      if (pauseCountRef.current === 0) {
        lastProgress = ((now - startedAt - pausedDurationRef.current) % cycleMs) / cycleMs;
        placeCards(lastProgress);
      }
      raf = requestAnimationFrame(animate);
    }

    function handleResize() {
      currentMetrics = metrics();
      placeCards(lastProgress);
    }

    pausedDurationRef.current = 0;
    pauseCountRef.current = 0;

    placeCards(0);
    raf = requestAnimationFrame(animate);

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className={styles.page} aria-labelledby="clients-heading">
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>OUR CLIENTS</p>
          <h1 id="clients-heading" className={styles.kicker}>
            OUR <span>CLIENTS</span>
          </h1>
          <div className={styles.rule} />
          <p className={styles.intro}>
            Your brand deserves more than ads.
            <br />
            It deserves a <strong>growth engine.</strong>
          </p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statIcon}>
                <Users size={18} />
              </span>
              <div>
                <strong>{clientStats.happyClients}+</strong>
                <span>Happy Clients</span>
              </div>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>
                <TrendingUp size={18} />
              </span>
              <div>
                <strong>{clientStats.successfulProjects}+</strong>
                <span>Successful Projects</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.analytics}>
          <GrowthPanel growth={heroStats.growth} />
          <RevenuePanel revenue={heroStats.revenue} />
          <RoiPanel roi={heroStats.roi} />
        </div>

        <div className={styles.railLayer}>
          <svg
            ref={arrowSvgRef}
            className={styles.arrow}
            viewBox="0 0 1440 650"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="clients-arrow-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#A984E3" />
                <stop offset=".55" stopColor="#6c4cf1" />
                <stop offset="1" stopColor="#6c4cf1" />
              </linearGradient>
            </defs>
            <path
              className={styles.arrowShadow}
              d={growthArrowPath}
            />
            <path
              className={styles.arrowEdge}
              d={growthArrowPath}
            />
            <path
              ref={arrowPathRef}
              className={styles.arrowPath}
              d={growthArrowPath}
            />
            <polygon data-growth-arrow-tip className={styles.arrowHead} points="1326,-58 1296,4 1356,4" />
          </svg>

          <div className={styles.desktopLogos}>
            {clientLogoImages.map((logo, index) => (
              <Link
                key={logo.file}
                href={getLogoProjectHref(logo.file, logo.name)}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                className={styles.clientCard}
                aria-label={`Open ${logo.name} case study`}
                onPointerEnter={pauseMotion}
                onPointerLeave={resumeMotion}
                onFocus={pauseMotion}
                onBlur={resumeMotion}
              >
                <span className={styles.logoImage}>
                  <Image
                    src={logo.file}
                    alt=""
                    fill
                    sizes="42px"
                    className={styles.logoPhoto}
                    style={{ objectPosition: logo.objectPosition }}
                  />
                </span>
                <strong>{logo.name}</strong>
                <small>{logo.category}</small>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.mobileLogos} aria-label="Our client logos">
          {clientLogoImages.map((logo) => (
            <Link
              key={logo.file}
              href={getLogoProjectHref(logo.file, logo.name)}
              className={styles.mobileLogoCard}
              aria-label={`Open ${logo.name} case study`}
            >
              <span className={styles.logoImage}>
                <Image
                  src={logo.file}
                  alt=""
                  fill
                  sizes="44px"
                  className={styles.logoPhoto}
                  style={{ objectPosition: logo.objectPosition }}
                />
              </span>
              <span>
                <strong>{logo.name}</strong>
                <small>{logo.category}</small>
              </span>
            </Link>
          ))}
        </div>

        <div className={styles.features}>
          {valueProps.map((item) => {
            const Icon = featureIcons[item.icon];
            return (
              <div key={item.title} className={styles.feature}>
                <span className={styles.featureIcon}>
                  <Icon size={28} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
