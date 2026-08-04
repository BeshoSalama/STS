"use client";

import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
};

type NetworkNode = Point & {
  depth: number;
  targetX: number;
  targetY: number;
  radius: number;
};

type Edge = {
  from: number;
  to: number;
  depth: number;
};

type Building = {
  x: number;
  baseY: number;
  width: number;
  height: number;
  phase: number;
  spire: boolean;
  tiers: number;
  roof: "flat" | "crown" | "slant";
  reveal: number;
};

const LOOP_DURATION = 30_000;
const TWO_PI = Math.PI * 2;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - clamp(value), 3);
}

function easeInOutCubic(value: number) {
  const t = clamp(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function cubicBezierPoint(start: Point, controlOne: Point, controlTwo: Point, end: Point, amount: number): Point {
  const inverse = 1 - amount;
  return {
    x:
      inverse ** 3 * start.x +
      3 * inverse ** 2 * amount * controlOne.x +
      3 * inverse * amount ** 2 * controlTwo.x +
      amount ** 3 * end.x,
    y:
      inverse ** 3 * start.y +
      3 * inverse ** 2 * amount * controlOne.y +
      3 * inverse * amount ** 2 * controlTwo.y +
      amount ** 3 * end.y,
  };
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function arrowTarget(index: number, count: number, random: () => number): Point {
  const ratio = index / Math.max(1, count - 1);

  if (ratio < 0.74) {
    const t = ratio / 0.74;
    const start = { x: 0.46, y: 0.78 };
    const controlOne = { x: 0.59, y: 0.84 };
    const controlTwo = { x: 0.79, y: 0.51 };
    const end = { x: 0.91, y: 0.18 };
    const center = cubicBezierPoint(start, controlOne, controlTwo, end, t);
    const next = cubicBezierPoint(start, controlOne, controlTwo, end, Math.min(1, t + 0.015));
    const dx = next.x - center.x;
    const dy = next.y - center.y;
    const length = Math.max(0.001, Math.hypot(dx, dy));
    const thickness = lerp(0.07, 0.022, t);
    const offset = (random() - 0.5) * thickness * 2;

    return {
      x: center.x + (-dy / length) * offset,
      y: center.y + (dx / length) * offset,
    };
  }

  const t = (ratio - 0.74) / 0.26;
  const headLane = index % 3;

  if (headLane === 0) {
    return {
      x: lerp(0.74, 0.91, t) + (random() - 0.5) * 0.012,
      y: lerp(0.28, 0.18, t) + (random() - 0.5) * 0.018,
    };
  }

  if (headLane === 1) {
    return {
      x: lerp(0.91, 0.83, t) + (random() - 0.5) * 0.012,
      y: lerp(0.18, 0.45, t) + (random() - 0.5) * 0.018,
    };
  }

  return {
    x: lerp(0.77, 0.91, t) + (random() - 0.5) * 0.014,
    y: lerp(0.36, 0.18, t) + (random() - 0.5) * 0.018,
  };
}

function makeScene(width: number, height: number) {
  const random = seededRandom(314159);
  const compact = width < 720;
  const root = compact ? { x: 0.53, y: 0.52 } : { x: 0.65, y: 0.5 };
  const nodes: NetworkNode[] = [
    {
      ...root,
      depth: 0,
      targetX: compact ? 0.2 : 0.47,
      targetY: compact ? 0.79 : 0.76,
      radius: 2.5,
    },
  ];
  const edges: Edge[] = [];
  const branchCount = compact ? 10 : 16;
  const steps = compact ? 5 : 6;
  const arrowTargetCount = Math.ceil(branchCount * steps * 1.55);

  for (let branch = 0; branch < branchCount; branch += 1) {
    let parent = 0;
    const baseAngle = -Math.PI + (branch / branchCount) * TWO_PI;

    for (let depth = 1; depth <= steps; depth += 1) {
      const previous = nodes[parent];
      const angle = baseAngle + (random() - 0.5) * 0.5;
      const stride = lerp(0.052, 0.084, random());
      const x = clamp(previous.x + Math.cos(angle) * stride, compact ? 0.12 : 0.44, 0.96);
      const y = clamp(previous.y + Math.sin(angle) * stride * 1.08, 0.13, 0.91);
      const target = arrowTarget(nodes.length, arrowTargetCount, random);
      const nodeIndex = nodes.length;

      nodes.push({
        x,
        y,
        depth,
        targetX: compact ? 0.12 + target.x * 0.88 : target.x,
        targetY: compact ? 0.42 + target.y * 0.56 : target.y,
        radius: lerp(0.85, 1.8, random()),
      });
      edges.push({ from: parent, to: nodeIndex, depth });
      parent = nodeIndex;

      if (depth > 1 && random() > 0.47) {
        const twigAngle = angle + (random() > 0.5 ? 1 : -1) * lerp(0.5, 0.95, random());
        const twigTarget = arrowTarget(nodes.length, arrowTargetCount, random);
        const twigIndex = nodes.length;
        nodes.push({
          x: clamp(x + Math.cos(twigAngle) * stride * 0.68, compact ? 0.1 : 0.42, 0.97),
          y: clamp(y + Math.sin(twigAngle) * stride * 0.9, 0.1, 0.93),
          depth: depth + 0.6,
          targetX: compact ? 0.12 + twigTarget.x * 0.88 : twigTarget.x,
          targetY: compact ? 0.42 + twigTarget.y * 0.56 : twigTarget.y,
          radius: lerp(0.65, 1.35, random()),
        });
        edges.push({ from: nodeIndex, to: twigIndex, depth: depth + 0.6 });
      }
    }
  }

  for (let index = 2; index < nodes.length; index += 1) {
    if (index % 3 !== 0) continue;
    let closest = -1;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (let other = 1; other < nodes.length; other += 1) {
      if (other === index || Math.abs(nodes[other].depth - nodes[index].depth) > 1.2) continue;
      const distance = Math.hypot(nodes[index].x - nodes[other].x, nodes[index].y - nodes[other].y);
      if (distance < closestDistance) {
        closest = other;
        closestDistance = distance;
      }
    }

    if (closest >= 0 && closestDistance < 0.18) {
      edges.push({ from: index, to: closest, depth: nodes[index].depth + 0.4 });
    }
  }

  const stars = Array.from({ length: compact ? 56 : 150 }, () => ({
    x: random(),
    y: random(),
    radius: lerp(0.25, 1.25, random()),
    alpha: lerp(0.08, 0.42, random()),
    phase: random() * TWO_PI,
  }));

  const buildingCount = compact ? 25 : 39;
  const cityLeft = compact ? 0.27 : 0.44;
  const cityRight = compact ? 0.96 : 0.95;
  const buildings: Building[] = Array.from({ length: buildingCount }, (_, index) => {
    const position = index / Math.max(1, buildingCount - 1);
    const x = lerp(cityLeft, cityRight, position) + (random() - 0.5) * (compact ? 0.01 : 0.006);
    const depthLayer = index % 3;
    const skylineShape = 0.055 + Math.pow(Math.sin(position * Math.PI), 1.18) * 0.12;
    const mainTower = index === Math.floor(buildingCount * 0.46);
    const sideTower = index === Math.floor(buildingCount * 0.2) || index === Math.floor(buildingCount * 0.73);
    const towerBoost = mainTower ? 0.19 : sideTower ? 0.075 : 0;
    const roofRoll = random();
    const roof: Building["roof"] = mainTower || roofRoll > 0.76 ? "crown" : roofRoll > 0.46 ? "slant" : "flat";

    return {
      x,
      baseY: (compact ? 0.82 : 0.79) + depthLayer * (compact ? 0.014 : 0.011) + (random() - 0.5) * 0.006,
      width: lerp(0.008, mainTower ? 0.021 : 0.017, random()),
      height: skylineShape + random() * 0.08 + towerBoost,
      phase: random() * TWO_PI,
      spire: index % 6 === 1 || mainTower || sideTower,
      tiers: mainTower ? 2 : random() > 0.82 ? 2 : 1,
      roof,
      reveal: Math.abs(x - root.x) * 0.78 + random() * 0.08,
    };
  }).sort((a, b) => a.reveal - b.reveal);

  return { nodes, edges, stars, buildings, width, height, compact };
}

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dashboardGrowthRef = useRef<HTMLElement | null>(null);
  const dashboardRoiRef = useRef<HTMLElement | null>(null);
  const dashboardRevenueRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !parent || !context) return;

    let scene = makeScene(1, 1);
    let frame = 0;
    let generation = 0;
    let startedAt = performance.now();
    let isVisible = true;
    let isIntersecting = true;
    let currentClock = startedAt;
    let currentFoundationProgress = 0;
    let lastPhase = "";
    const prefersReducedHeroMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPowerDevice = (navigator.hardwareConcurrency || 8) <= 4;
    const ctaEnergy = {
      x: 0,
      y: 0,
      strength: 0,
      targetStrength: 0,
    };
    const dashboardAnimationElements = Array.from(
      parent.querySelectorAll<HTMLElement | SVGElement>(
        ".hero-dashboard-stage, .hero-dashboard-satellite, .hero-dashboard-bar, .hero-dashboard-line"
      )
    );

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, lowPowerDevice || prefersReducedHeroMotion ? 1 : 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = makeScene(width, height);
    };

    const pointAt = (node: NetworkNode, morph: number, index = 0): Point => {
      const baseX = lerp(node.x, node.targetX, morph) * scene.width;
      const baseY = lerp(node.y, node.targetY, morph) * scene.height;
      if (ctaEnergy.strength < 0.002) return { x: baseX, y: baseY };

      const side = index % 2 === 0 ? -1 : 1;
      const lane = ((index * 5) % 13) - 6;
      const targetX = ctaEnergy.x + side * (142 + (index % 7) * 18);
      const targetY = ctaEnergy.y + lane * 11 + Math.sin(currentClock * 0.0018 + index) * 4;
      const gather = ctaEnergy.strength * (0.48 + (index % 5) * 0.055);

      return {
        x: lerp(baseX, targetX, gather),
        y: lerp(baseY, targetY, gather),
      };
    };

    const networkMask = (point: Point) => {
      if (scene.compact) return 1;
      return easeInOutCubic((point.x - scene.width * 0.58) / (scene.width * 0.08));
    };

    const drawGlow = (x: number, y: number, radius: number, alpha: number) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      gradient.addColorStop(0.16, `rgba(199, 155, 255, ${alpha * 0.9})`);
      gradient.addColorStop(0.48, `rgba(125, 68, 255, ${alpha * 0.38})`);
      gradient.addColorStop(1, "rgba(91, 42, 158, 0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, TWO_PI);
      context.fill();
    };

    const drawStarFlare = (x: number, y: number, size: number, alpha: number) => {
      if (alpha <= 0.002) return;

      context.save();
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";

      const core = context.createRadialGradient(x, y, 0, x, y, size);
      core.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      core.addColorStop(0.2, `rgba(218, 186, 255, ${alpha * 0.82})`);
      core.addColorStop(0.58, `rgba(119, 67, 255, ${alpha * 0.38})`);
      core.addColorStop(1, "rgba(91, 42, 158, 0)");
      context.fillStyle = core;
      context.beginPath();
      context.arc(x, y, size, 0, TWO_PI);
      context.fill();

      for (let ray = 0; ray < 8; ray += 1) {
        const angle = (ray / 8) * TWO_PI;
        const length = size * (ray % 2 === 0 ? 1.85 : 1.18);
        const gradient = context.createLinearGradient(
          x - Math.cos(angle) * size * 0.24,
          y - Math.sin(angle) * size * 0.24,
          x + Math.cos(angle) * length,
          y + Math.sin(angle) * length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.92})`);
        gradient.addColorStop(0.48, `rgba(179, 114, 255, ${alpha * 0.42})`);
        gradient.addColorStop(1, "rgba(179, 114, 255, 0)");
        context.beginPath();
        context.moveTo(x - Math.cos(angle) * size * 0.22, y - Math.sin(angle) * size * 0.22);
        context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        context.strokeStyle = gradient;
        context.lineWidth = ray % 2 === 0 ? 1.15 : 0.58;
        context.stroke();
      }

      context.fillStyle = `rgba(255, 249, 255, ${alpha})`;
      context.beginPath();
      context.arc(x, y, Math.max(1.3, size * 0.12), 0, TWO_PI);
      context.fill();
      context.restore();
    };

    const drawSparkRays = (progress: number, fadeProgress: number, clock: number) => {
      const opacity = progress * (1 - fadeProgress);
      if (opacity <= 0.002) return;
      const root = scene.nodes[0];
      const x = root.x * scene.width;
      const y = root.y * scene.height;

      context.save();
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";
      for (let ray = 0; ray < 34; ray += 1) {
        const angle = (ray / 34) * TWO_PI + Math.sin(ray * 1.91) * 0.075;
        const inner = 4 + (ray % 3) * 1.35;
        const length = (34 + (ray % 7) * 10) * easeOutCubic(progress);
        const startX = x + Math.cos(angle) * inner;
        const startY = y + Math.sin(angle) * inner;
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        const gradient = context.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, `rgba(255, 242, 255, ${0.94 * opacity})`);
        gradient.addColorStop(0.55, `rgba(190, 121, 255, ${0.7 * opacity})`);
        gradient.addColorStop(1, "rgba(89, 151, 255, 0)");
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.strokeStyle = gradient;
        context.lineWidth = ray % 6 === 0 ? 1.08 : 0.56;
        context.stroke();

        if (ray % 4 === 0) {
          const pulse = 0.75 + Math.sin(clock * 0.006 + ray) * 0.25;
          drawGlow(endX, endY, 7.5, 0.28 * opacity * pulse);
        }
      }
      context.restore();
    };

    const drawLeftDataDust = (progress: number, clock: number) => {
      if (scene.compact || progress <= 0.002) return;

      context.save();
      context.globalCompositeOperation = "lighter";

      for (const star of scene.stars) {
        if (star.x > 0.6 || star.y < 0.18 || star.y > 0.88) continue;
        const drift = Math.sin(clock * 0.00028 + star.phase) * 7;
        const x = star.x * scene.width + drift;
        const y = star.y * scene.height + Math.cos(clock * 0.00023 + star.phase) * 5;
        const pulse = 0.62 + Math.sin(clock * 0.0024 + star.phase * 2.1) * 0.38;
        const alpha = progress * star.alpha * (0.78 + pulse * 1.05);

        context.fillStyle = `rgba(213, 178, 255, ${alpha * 0.52})`;
        context.beginPath();
        context.arc(x, y, star.radius * 0.82, 0, TWO_PI);
        context.fill();
      }

      context.restore();
    };

    const drawConstellationWeb = (progress: number, flareProgress: number, clock: number, morph: number, elapsed: number) => {
      if (progress <= 0.002) return;
      const edgeCount = scene.edges.length;
      const runnerCount = scene.compact ? 24 : 46;
      const curvePoint = (from: Point, to: Point, amount: number): Point => {
        const bendX = (from.x + to.x) / 2 + (to.y - from.y) * 0.06;
        const bendY = (from.y + to.y) / 2 - (to.x - from.x) * 0.035;
        const inverse = 1 - amount;
        return {
          x: inverse * inverse * from.x + 2 * inverse * amount * bendX + amount * amount * to.x,
          y: inverse * inverse * from.y + 2 * inverse * amount * bendY + amount * amount * to.y,
        };
      };

      context.save();
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";

      for (let runner = 0; runner < runnerCount; runner += 1) {
        const edge = scene.edges[(runner * 17 + 5) % edgeCount];
        if (!edge) continue;
        const from = pointAt(scene.nodes[edge.from], morph, edge.from);
        const to = pointAt(scene.nodes[edge.to], morph, edge.to);
        const mask = edge.from === 0 ? 1 : Math.min(networkMask(from), networkMask(to));
        if (mask <= 0.04) continue;

        const speed = scene.compact ? 0.00019 : 0.00016;
        const travel = (clock * speed + runner * 0.071) % 1;
        const trailTravel = clamp(travel - 0.1);
        const point = curvePoint(from, to, travel);
        const trail = curvePoint(from, to, trailTravel);
        const twinkle = 0.55 + Math.sin(clock * 0.0032 + runner * 1.87) * 0.45;
        const hotRunner = runner % 7 === 0 || runner % 13 === 0;
        const longTravel = easeInOutCubic((elapsed - 9_100) / 1_700);
        const flare = hotRunner ? flareProgress * longTravel * (0.78 + twinkle * 0.46) : 0;
        const alpha = progress * mask * (0.32 + twinkle * 0.36);

        const trailGradient = context.createLinearGradient(trail.x, trail.y, point.x, point.y);
        trailGradient.addColorStop(0, "rgba(128, 74, 255, 0)");
        trailGradient.addColorStop(0.48, `rgba(132, 217, 255, ${alpha * 0.34})`);
        trailGradient.addColorStop(1, `rgba(242, 227, 255, ${alpha * (0.62 + flare)})`);
        context.beginPath();
        context.moveTo(trail.x, trail.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = trailGradient;
        context.lineWidth = hotRunner ? 0.9 + flare * 0.7 : 0.52;
        context.stroke();

        if (flare > 0.04) {
          drawStarFlare(point.x, point.y, (scene.compact ? 8 : 12) + flare * 10, alpha * flare * 1.55);
        } else if (hotRunner) {
          drawGlow(point.x, point.y, 8, alpha * 0.42);
        }

        context.fillStyle = `rgba(238, 225, 255, ${clamp(alpha * 1.2 + flare * 0.38)})`;
        context.beginPath();
        context.arc(point.x, point.y, hotRunner ? 1.6 + flare * 1.1 : 1.05, 0, TWO_PI);
        context.fill();
      }

      context.restore();
    };

    const drawSkyline = (progress: number, clock: number) => {
      if (progress <= 0) return;
      const heightScale = scene.compact ? 0.58 : 1;
      const cityRoot = {
        x: scene.nodes[0].x * scene.width,
        y: lerp(scene.nodes[0].y, scene.compact ? 0.82 : 0.79, currentFoundationProgress) * scene.height,
      };
      const basePoints = scene.buildings.map((building) => ({
        x: building.x * scene.width,
        y: building.baseY * scene.height,
      }));

      context.save();
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";
      context.lineJoin = "round";

      /* Keep the city foundation as a distributed mesh, not a solid ground strip. */
      basePoints.forEach((base, index) => {
        const building = scene.buildings[index];
        const rootProgress = easeOutCubic(progress * 1.7 - (index / scene.buildings.length) * 0.48);
        if (rootProgress <= 0) return;

        const meshLift = (scene.compact ? 18 : 28) * (0.35 + (index % 5) * 0.12);
        const meshDrift = Math.sin(index * 1.93) * (scene.compact ? 8 : 14);
        const meshNode = {
          x: base.x + meshDrift,
          y: base.y - meshLift + Math.cos(index * 2.41) * (scene.compact ? 3 : 5),
        };
        const anchorAlpha = 0.28 + (index % 4) * 0.08;

        if (index % 2 === 0) {
          const rootGradient = context.createLinearGradient(cityRoot.x, cityRoot.y, meshNode.x, meshNode.y);
          rootGradient.addColorStop(0, `rgba(250, 226, 255, ${0.42 * rootProgress})`);
          rootGradient.addColorStop(0.5, `rgba(171, 105, 255, ${0.28 * rootProgress})`);
          rootGradient.addColorStop(1, `rgba(91, 54, 218, ${0.08 * rootProgress})`);
          context.strokeStyle = rootGradient;
          context.lineWidth = 0.42;
          context.beginPath();
          context.moveTo(cityRoot.x, cityRoot.y);
          context.lineTo(lerp(cityRoot.x, meshNode.x, rootProgress), lerp(cityRoot.y, meshNode.y, rootProgress));
          context.stroke();
        }

        const linkedIndex = Math.min(basePoints.length - 1, index + 2 + (index % 3));
        const linked = basePoints[linkedIndex];
        if (linked && linkedIndex !== index) {
          const linkedMesh = {
            x: linked.x + Math.sin(linkedIndex * 1.93) * (scene.compact ? 8 : 14),
            y:
              linked.y -
              (scene.compact ? 18 : 28) * (0.35 + (linkedIndex % 5) * 0.12) +
              Math.cos(linkedIndex * 2.41) * (scene.compact ? 3 : 5),
          };
          const meshGradient = context.createLinearGradient(meshNode.x, meshNode.y, linkedMesh.x, linkedMesh.y);
          meshGradient.addColorStop(0, `rgba(220, 185, 255, ${0.32 * rootProgress})`);
          meshGradient.addColorStop(1, `rgba(104, 209, 255, ${0.14 * rootProgress})`);
          context.strokeStyle = meshGradient;
          context.lineWidth = 0.45;
          context.beginPath();
          context.moveTo(meshNode.x, meshNode.y);
          context.lineTo(lerp(meshNode.x, linkedMesh.x, rootProgress), lerp(meshNode.y, linkedMesh.y, rootProgress));
          context.stroke();
        }

        const towerStem = context.createLinearGradient(meshNode.x, meshNode.y, base.x, base.y);
        towerStem.addColorStop(0, `rgba(116, 218, 255, ${0.16 * rootProgress})`);
        towerStem.addColorStop(1, `rgba(229, 193, 255, ${0.48 * rootProgress})`);
        context.strokeStyle = towerStem;
        context.lineWidth = 0.5;
        context.beginPath();
        context.moveTo(meshNode.x, meshNode.y);
        context.lineTo(lerp(meshNode.x, base.x, rootProgress), lerp(meshNode.y, base.y, rootProgress));
        context.stroke();

        context.fillStyle = `rgba(193, 139, 255, ${0.46 * rootProgress})`;
        context.beginPath();
        context.arc(meshNode.x, meshNode.y, index % 5 === 0 ? 1.45 : 0.85, 0, TWO_PI);
        context.fill();

        if (index % 4 === 0) drawGlow(base.x, base.y, 10, anchorAlpha * rootProgress);
        context.fillStyle = `rgba(232, 198, 255, ${0.7 * rootProgress})`;
        context.beginPath();
        context.arc(base.x, base.y, index % 5 === 0 ? 1.9 : 1.1, 0, TWO_PI);
        context.fill();
      });

      scene.buildings.forEach((building, index) => {
        const buildingProgress = easeOutCubic(progress * 1.6 - (index / scene.buildings.length) * 0.48);
        if (buildingProgress <= 0) return;

        const base = basePoints[index];
        const width = Math.max(scene.compact ? 4 : 6, building.width * scene.width);
        const fullHeight = building.height * heightScale * scene.height;
        const height = fullHeight * buildingProgress;
        const top = base.y - height;
        const flicker = 0.72 + Math.sin(clock * 0.0024 + building.phase) * 0.18;
        const tierCount = building.tiers;

        for (let tier = 0; tier < tierCount; tier += 1) {
          const tierBottom = base.y - (height * tier) / tierCount;
          const fullTierTop = base.y - (height * (tier + 1)) / tierCount;
          const tierWidth = width * (1 - tier * 0.15);
          const left = base.x - tierWidth / 2;
          const fill = context.createLinearGradient(0, fullTierTop, 0, tierBottom);
          fill.addColorStop(0, `rgba(141, 83, 255, ${0.12 * progress * flicker})`);
          fill.addColorStop(1, `rgba(69, 29, 158, ${0.018 * progress})`);
          context.fillStyle = fill;
          context.fillRect(left, fullTierTop, tierWidth, tierBottom - fullTierTop);

          context.strokeStyle = `rgba(166, 108, 255, ${0.68 * progress * flicker})`;
          context.lineWidth = tier === tierCount - 1 ? 0.8 : 0.62;
          context.strokeRect(left, fullTierTop, tierWidth, tierBottom - fullTierTop);

          context.beginPath();
          context.moveTo(left, fullTierTop);
          context.lineTo(left + tierWidth, fullTierTop);
          context.strokeStyle = `rgba(226, 191, 255, ${0.72 * progress * flicker})`;
          context.lineWidth = 0.7;
          context.stroke();

          const floorGap = Math.max(4.5, Math.min(8, (tierBottom - fullTierTop) / 4));
          for (let floorY = fullTierTop + floorGap; floorY < tierBottom - 2; floorY += floorGap) {
            context.strokeStyle = `rgba(207, 163, 255, ${0.36 * progress * flicker})`;
            context.lineWidth = 0.45;
            context.beginPath();
            context.moveTo(left + 1, floorY);
            context.lineTo(left + tierWidth - 1, floorY);
            context.stroke();
          }

          if (tierWidth > 8) {
            context.strokeStyle = `rgba(160, 105, 255, ${0.27 * progress})`;
            context.lineWidth = 0.38;
            for (const column of [0.33, 0.66]) {
              context.beginPath();
              context.moveTo(left + tierWidth * column, fullTierTop + 1);
              context.lineTo(left + tierWidth * column, tierBottom - 1);
              context.stroke();
            }
          }
        }

        if (building.roof === "slant") {
          context.beginPath();
          context.moveTo(base.x - width * 0.52, top);
          context.lineTo(base.x + width * 0.1, top - width * 0.32);
          context.lineTo(base.x + width * 0.52, top);
          context.strokeStyle = `rgba(226, 191, 255, ${0.56 * progress})`;
          context.lineWidth = 0.75;
          context.stroke();
        } else if (building.roof === "crown") {
          const crownHeight = Math.min(18, fullHeight * 0.1) * buildingProgress;
          context.beginPath();
          context.moveTo(base.x - width * 0.5, top);
          context.lineTo(base.x, top - crownHeight);
          context.lineTo(base.x + width * 0.5, top);
          context.strokeStyle = `rgba(226, 191, 255, ${0.62 * progress})`;
          context.lineWidth = 0.8;
          context.stroke();
        }

        if (building.spire) {
          const spireHeight = Math.min(34, fullHeight * 0.24) * buildingProgress;
          const crownHeight = building.roof === "crown" ? Math.min(18, fullHeight * 0.1) * buildingProgress : 0;
          context.beginPath();
          context.moveTo(base.x, top - crownHeight);
          context.lineTo(base.x, top - spireHeight - crownHeight);
          context.strokeStyle = `rgba(230, 194, 255, ${0.72 * progress})`;
          context.lineWidth = 0.8;
          context.stroke();
          drawGlow(base.x, top - spireHeight, 7, 0.3 * progress);
        }
      });

      context.restore();
    };

    const drawGrowthTrend = (progress: number, exitProgress: number, clock: number) => {
      const opacity = progress * (1 - exitProgress * 0.72);
      if (opacity <= 0.002) return;
      const compactShift = scene.compact ? { x: 0.12, y: 0.42, sx: 0.88, sy: 0.56 } : { x: 0, y: 0, sx: 1, sy: 1 };
      const map = (x: number, y: number) => ({
        x: (compactShift.x + x * compactShift.sx) * scene.width,
        y: (compactShift.y + y * compactShift.sy) * scene.height,
      });
      const points = [
        map(0.47, 0.77),
        map(0.54, 0.69),
        map(0.6, 0.67),
        map(0.66, 0.56),
        map(0.72, 0.51),
        map(0.78, 0.38),
        map(0.84, 0.31),
        map(0.88, 0.22),
      ];

      context.save();
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";
      const gradient = context.createLinearGradient(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y);
      gradient.addColorStop(0, `rgba(105, 217, 255, ${0.7 * opacity})`);
      gradient.addColorStop(0.58, `rgba(183, 111, 255, ${0.9 * opacity})`);
      gradient.addColorStop(1, `rgba(250, 231, 255, ${0.98 * opacity})`);

      let head = points[0];
      for (let index = 0; index < points.length - 1; index += 1) {
        const segmentProgress = clamp(progress * (points.length - 1) - index);
        if (segmentProgress <= 0) break;
        const start = points[index];
        const target = points[index + 1];
        const end = {
          x: lerp(start.x, target.x, easeOutCubic(segmentProgress)),
          y: lerp(start.y, target.y, easeOutCubic(segmentProgress)),
        };
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle = gradient;
        context.lineWidth = scene.compact ? 1.55 : 2.25;
        context.stroke();
        head = end;

        if (segmentProgress >= 0.98) {
          drawGlow(target.x, target.y, 13, 0.38 * opacity);
          context.fillStyle = `rgba(236, 213, 255, ${0.9 * opacity})`;
          context.beginPath();
          context.arc(target.x, target.y, scene.compact ? 1.9 : 2.8, 0, TWO_PI);
          context.fill();
        }
      }

      const travelPulse = 0.68 + Math.sin(clock * 0.007) * 0.32;
      drawGlow(head.x, head.y, 16 + travelPulse * 7, 0.46 * opacity);

      if (progress > 0.8) {
        const tip = points[points.length - 1];
        const previous = points[points.length - 2];
        const angle = Math.atan2(tip.y - previous.y, tip.x - previous.x);
        const headLength = scene.compact ? 12 : 19;
        context.beginPath();
        context.moveTo(tip.x - Math.cos(angle - 0.62) * headLength, tip.y - Math.sin(angle - 0.62) * headLength);
        context.lineTo(tip.x, tip.y);
        context.lineTo(tip.x - Math.cos(angle + 0.62) * headLength, tip.y - Math.sin(angle + 0.62) * headLength);
        context.strokeStyle = `rgba(246, 221, 255, ${0.94 * opacity})`;
        context.lineWidth = scene.compact ? 1.7 : 2.5;
        context.stroke();
      }
      context.restore();
    };

    const drawDashboard = (progress: number, exitProgress: number, clock: number) => {
      const opacity = progress * (1 - exitProgress);
      if (opacity <= 0.002) return;

      const width = scene.compact ? 154 : 292;
      const height = scene.compact ? 116 : 188;
      const anchorX = scene.compact ? scene.width * 0.48 : scene.width * 0.51;
      const anchorY = scene.compact ? scene.height * 0.55 : scene.height * 0.32;
      const rise = (1 - easeOutCubic(progress)) * 42;
      const scale = lerp(0.9, 1, easeOutCubic(progress));

      context.save();
      context.globalCompositeOperation = "source-over";
      context.globalAlpha = opacity;
      context.translate(anchorX + width / 2, anchorY + height / 2 + rise);
      context.rotate(scene.compact ? -0.03 : -0.06);
      context.scale(scale, scale);
      context.translate(-width / 2, -height / 2);

      const aura = context.createRadialGradient(width * 0.55, height * 0.52, 4, width * 0.55, height * 0.52, width * 0.78);
      aura.addColorStop(0, "rgba(121, 74, 255, 0.28)");
      aura.addColorStop(1, "rgba(70, 23, 155, 0)");
      context.fillStyle = aura;
      context.fillRect(-width * 0.28, -height * 0.48, width * 1.65, height * 1.95);

      context.beginPath();
      context.roundRect(0, 0, width, height, scene.compact ? 7 : 9);
      context.fillStyle = "rgba(13, 5, 34, 0.94)";
      context.fill();
      context.strokeStyle = "rgba(174, 118, 255, 0.72)";
      context.lineWidth = 1;
      context.stroke();

      context.fillStyle = "rgba(244, 232, 255, 0.94)";
      context.font = `700 ${scene.compact ? 9 : 13}px sans-serif`;
      context.fillText("STS", width * 0.08, height * 0.14);

      for (let index = 0; index < 2; index += 1) {
        const rowY = height * (0.24 + index * 0.11);
        context.beginPath();
        context.roundRect(width * 0.08, rowY, width * 0.44, height * 0.07, 4);
        context.fillStyle = "rgba(96, 48, 196, 0.14)";
        context.fill();
        context.strokeStyle = "rgba(181, 126, 255, 0.2)";
        context.stroke();
        context.fillStyle = "rgba(205, 169, 255, 0.65)";
        context.fillRect(width * 0.15, rowY + height * 0.026, width * (0.26 + index * 0.06), 2);
        context.beginPath();
        context.arc(width * 0.11, rowY + height * 0.035, scene.compact ? 2 : 3, 0, TWO_PI);
        context.strokeStyle = "rgba(118, 220, 255, 0.7)";
        context.stroke();
      }

      const ringX = width * 0.74;
      const ringY = height * 0.29;
      context.beginPath();
      context.arc(ringX, ringY, height * 0.095, 0.15, TWO_PI * 0.82);
      context.strokeStyle = "rgba(183, 112, 255, 0.88)";
      context.lineWidth = scene.compact ? 3 : 5;
      context.stroke();
      context.beginPath();
      context.arc(ringX, ringY, height * 0.045, 0, TWO_PI);
      context.strokeStyle = "rgba(101, 218, 255, 0.42)";
      context.lineWidth = 1;
      context.stroke();

      const chartX = width * 0.08;
      const chartY = height * 0.48;
      const chartW = width * 0.82;
      const chartH = height * 0.38;
      context.beginPath();
      context.roundRect(chartX, chartY, chartW, chartH, 6);
      context.fillStyle = "rgba(94, 46, 187, 0.13)";
      context.fill();
      context.strokeStyle = "rgba(171, 128, 255, 0.22)";
      context.stroke();

      const bars = [0.3, 0.46, 0.38, 0.62, 0.54, 0.77, 0.95, 0.68, 0.83];
      bars.forEach((bar, index) => {
        const barW = chartW / (bars.length * 1.7);
        const gap = chartW / bars.length;
        const animated = bar * (0.72 + Math.sin(clock * 0.0017 + index) * 0.04);
        const barH = chartH * animated * progress;
        const gradient = context.createLinearGradient(0, chartY + chartH - barH, 0, chartY + chartH);
        gradient.addColorStop(0, "rgba(199, 146, 255, 0.95)");
        gradient.addColorStop(1, "rgba(87, 44, 210, 0.4)");
        context.fillStyle = gradient;
        context.fillRect(chartX + gap * (index + 0.45), chartY + chartH - barH, barW, barH);
      });

      context.beginPath();
      context.moveTo(chartX, chartY + chartH + 5);
      context.lineTo(chartX + chartW, chartY + chartH + 5);
      context.strokeStyle = "rgba(135, 78, 255, 0.5)";
      context.lineWidth = 0.8;
      context.stroke();

      context.restore();
    };

    const drawImpact = (burstProgress: number, fadeProgress: number, clock: number) => {
      const intensity = burstProgress * (1 - fadeProgress);
      if (intensity <= 0.002) return;
      const compactShift = scene.compact ? { x: 0.12, y: 0.42, sx: 0.88, sy: 0.56 } : { x: 0, y: 0, sx: 1, sy: 1 };
      const x = (compactShift.x + 0.86 * compactShift.sx) * scene.width;
      const y = (compactShift.y + 0.24 * compactShift.sy) * scene.height;
      const burst = easeOutCubic(burstProgress);

      context.save();
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";

      context.fillStyle = `rgba(255, 255, 255, ${0.16 * intensity})`;
      context.fillRect(0, 0, scene.width, scene.height);

      const flashRadius = (scene.compact ? 74 : 112) + burst * (scene.compact ? 150 : 250);
      const flashGradient = context.createRadialGradient(x, y, 0, x, y, flashRadius);
      flashGradient.addColorStop(0, `rgba(255, 255, 255, ${0.98 * intensity})`);
      flashGradient.addColorStop(0.08, `rgba(255, 255, 255, ${0.62 * intensity})`);
      flashGradient.addColorStop(0.34, `rgba(210, 177, 255, ${0.24 * intensity})`);
      flashGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.fillStyle = flashGradient;
      context.beginPath();
      context.arc(x, y, flashRadius, 0, TWO_PI);
      context.fill();

      for (let ray = 0; ray < 58; ray += 1) {
        const angle = (ray / 58) * TWO_PI + Math.sin(ray * 2.17) * 0.06;
        const inner = 5 + burst * 13;
        const maxLength = (scene.compact ? 86 : 170) + (ray % 8) * (scene.compact ? 12 : 30);
        const length = maxLength * (0.18 + burst * 0.82);
        const gradient = context.createLinearGradient(
          x + Math.cos(angle) * inner,
          y + Math.sin(angle) * inner,
          x + Math.cos(angle) * length,
          y + Math.sin(angle) * length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.88 * intensity})`);
        gradient.addColorStop(0.34, `rgba(219, 180, 255, ${0.46 * intensity})`);
        gradient.addColorStop(0.72, `rgba(112, 213, 255, ${0.16 * intensity})`);
        gradient.addColorStop(1, "rgba(158, 84, 255, 0)");
        context.beginPath();
        context.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
        context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        context.strokeStyle = gradient;
        context.lineWidth = ray % 9 === 0 ? 2.7 : ray % 4 === 0 ? 1.25 : 0.68;
        context.stroke();
      }

      for (let beam = 0; beam < 18; beam += 1) {
        const angle = Math.PI + 0.38 + Math.sin(beam * 1.71) * 0.34;
        const startDistance = (scene.compact ? 96 : 170) + beam * (scene.compact ? 8 : 15);
        const endDistance = 12 + burst * 22;
        const startX = x + Math.cos(angle) * startDistance;
        const startY = y + Math.sin(angle) * startDistance * 0.72;
        const endX = x + Math.cos(angle) * endDistance;
        const endY = y + Math.sin(angle) * endDistance * 0.72;
        const gradient = context.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, "rgba(113, 70, 255, 0)");
        gradient.addColorStop(0.5, `rgba(182, 105, 255, ${0.28 * intensity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${0.74 * intensity})`);
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.strokeStyle = gradient;
        context.lineWidth = beam % 5 === 0 ? 2.1 : 0.95;
        context.stroke();
      }

      for (let ring = 0; ring < 3; ring += 1) {
        const ringProgress = clamp(burst * 1.35 - ring * 0.18);
        context.beginPath();
        context.arc(x, y, (22 + ring * 21) + ringProgress * (scene.compact ? 58 : 105), 0, TWO_PI);
        context.strokeStyle = `rgba(222, 197, 255, ${intensity * (0.12 - ring * 0.025)})`;
        context.lineWidth = ring === 0 ? 0.9 : 0.55;
        context.stroke();
      }

      context.fillStyle = `rgba(255, 255, 255, ${0.94 * intensity})`;
      context.beginPath();
      context.arc(x, y, 8 + burst * 16, 0, TWO_PI);
      context.fill();

      for (let spike = 0; spike < 46; spike += 1) {
        const angle = (spike / 46) * TWO_PI + Math.sin(spike * 3.03) * 0.08;
        const start = 3 + burst * 7;
        const length = (scene.compact ? 120 : 230) + (spike % 9) * (scene.compact ? 14 : 34);
        const end = length * (0.35 + burst * 0.65);
        const gradient = context.createLinearGradient(
          x + Math.cos(angle) * start,
          y + Math.sin(angle) * start,
          x + Math.cos(angle) * end,
          y + Math.sin(angle) * end
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${clamp(0.98 * intensity + burst * 0.2)})`);
        gradient.addColorStop(0.42, `rgba(223, 184, 255, ${clamp(0.52 * intensity + burst * 0.08)})`);
        gradient.addColorStop(1, "rgba(113, 70, 255, 0)");
        context.beginPath();
        context.moveTo(x + Math.cos(angle) * start, y + Math.sin(angle) * start);
        context.lineTo(x + Math.cos(angle) * end, y + Math.sin(angle) * end);
        context.strokeStyle = gradient;
        context.lineWidth = spike % 8 === 0 ? 2.4 : spike % 3 === 0 ? 1.1 : 0.54;
        context.stroke();
      }
      context.restore();
    };

    const drawArrowAura = (progress: number, charge: number, clock: number) => {
      if (progress <= 0) return;
      const compactShift = scene.compact ? { x: 0.12, y: 0.42, sx: 0.88, sy: 0.56 } : { x: 0, y: 0, sx: 1, sy: 1 };
      const map = (x: number, y: number) => ({
        x: (compactShift.x + x * compactShift.sx) * scene.width,
        y: (compactShift.y + y * compactShift.sy) * scene.height,
      });
      const start = map(0.46, 0.78);
      const controlOne = map(0.59, 0.84);
      const controlTwo = map(0.79, 0.51);
      const tip = map(0.91, 0.18);

      context.save();
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";
      const brightness = 1 + charge * 2.15;

      for (let layer = 3; layer >= 0; layer -= 1) {
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.bezierCurveTo(controlOne.x, controlOne.y, controlTwo.x, controlTwo.y, tip.x, tip.y);
        context.strokeStyle =
          layer === 0
            ? `rgba(255, 238, 255, ${clamp(0.94 * progress * brightness)})`
            : `rgba(139, 69, 255, ${clamp((0.055 + layer * 0.035) * progress * brightness)})`;
        context.lineWidth = layer === 0 ? 2.35 + charge * 2.1 : 5 + layer * 7 + charge * 7;
        context.stroke();
      }

      for (let trail = -3; trail <= 3; trail += 1) {
        const offset = trail * 0.009;
        const trailStart = map(0.455, 0.78 + offset * 1.7);
        const trailControlOne = map(0.59, 0.84 + offset);
        const trailControlTwo = map(0.79, 0.51 + offset * 0.45);
        context.beginPath();
        context.moveTo(trailStart.x, trailStart.y);
        context.bezierCurveTo(
          trailControlOne.x,
          trailControlOne.y,
          trailControlTwo.x,
          trailControlTwo.y,
          tip.x,
          tip.y
        );
        context.strokeStyle =
          trail === 0
            ? `rgba(255, 239, 255, ${clamp(0.84 * progress * brightness)})`
            : trail % 2 === 0
              ? `rgba(96, 209, 255, ${clamp(0.34 * progress * brightness)})`
              : `rgba(190, 112, 255, ${clamp(0.46 * progress * brightness)})`;
        context.lineWidth = trail === 0 ? 1.7 + charge * 1.35 : 0.8 + charge * 0.45;
        context.stroke();
      }

      const headLeft = map(0.74, 0.28);
      const headBottom = map(0.83, 0.45);
      context.beginPath();
      context.moveTo(headLeft.x, headLeft.y);
      context.lineTo(tip.x, tip.y);
      context.lineTo(headBottom.x, headBottom.y);
      context.closePath();
      context.fillStyle = `rgba(139, 67, 255, ${clamp(0.11 * progress * brightness)})`;
      context.fill();

      for (let layer = 2; layer >= 0; layer -= 1) {
        context.beginPath();
        context.moveTo(headLeft.x, headLeft.y);
        context.lineTo(tip.x, tip.y);
        context.lineTo(headBottom.x, headBottom.y);
        context.strokeStyle =
          layer === 0
            ? `rgba(255, 236, 255, ${clamp(0.98 * progress * brightness)})`
            : `rgba(164, 78, 255, ${clamp((0.08 + layer * 0.05) * progress * brightness)})`;
        context.lineWidth = layer === 0 ? 2.35 + charge * 2.2 : 5 + layer * 6 + charge * 6;
        context.stroke();
      }

      const headInnerOne = map(0.78, 0.34);
      const headInnerTwo = map(0.85, 0.38);
      context.beginPath();
      context.moveTo(headInnerOne.x, headInnerOne.y);
      context.lineTo(tip.x, tip.y);
      context.moveTo(headInnerTwo.x, headInnerTwo.y);
      context.lineTo(tip.x, tip.y);
      context.strokeStyle = `rgba(230, 190, 255, ${clamp(0.58 * progress * brightness)})`;
      context.lineWidth = 0.9 + charge * 0.8;
      context.stroke();

      const pulse = (clock * 0.00016) % 1;
      const pulsePoint = cubicBezierPoint(start, controlOne, controlTwo, tip, pulse);
      drawGlow(pulsePoint.x, pulsePoint.y, 23 + charge * 18, clamp(0.68 * progress * brightness));

      if (charge > 0.02) {
        for (let particle = 0; particle < 32; particle += 1) {
          const travel = (particle / 32 + clock * 0.000035) % 1;
          const point = cubicBezierPoint(start, controlOne, controlTwo, tip, travel);
          const jitter = Math.sin(particle * 7.1 + clock * 0.003) * (scene.compact ? 5 : 10) * charge;
          const particleX = point.x + jitter;
          const particleY = point.y + Math.cos(particle * 4.7) * jitter * 0.55;
          if (particle % 5 === 0) drawGlow(particleX, particleY, 9 + charge * 9, 0.24 * charge * progress);
          context.fillStyle = `rgba(226, 183, 255, ${0.38 * charge * progress})`;
          context.beginPath();
          context.arc(particleX, particleY, particle % 6 === 0 ? 1.8 : 0.9, 0, TWO_PI);
          context.fill();
        }
      }

      drawGlow(tip.x, tip.y, 48 + charge * 76 + Math.sin(clock * 0.004) * 7, clamp((0.52 + charge * 0.36) * progress));
      context.restore();
    };

    const drawCtaEnergy = (clock: number) => {
      const strength = ctaEnergy.strength;
      if (ctaEnergy.x <= 0 || ctaEnergy.y <= 0) return;
      const visualStrength = 0.2 + strength * 0.8;

      context.save();
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";

      const cubicPoint = (
        start: Point,
        controlOne: Point,
        controlTwo: Point,
        end: Point,
        amount: number
      ) => {
        const inverse = 1 - amount;
        return {
          x:
            inverse ** 3 * start.x +
            3 * inverse ** 2 * amount * controlOne.x +
            3 * inverse * amount ** 2 * controlTwo.x +
            amount ** 3 * end.x,
          y:
            inverse ** 3 * start.y +
            3 * inverse ** 2 * amount * controlOne.y +
            3 * inverse * amount ** 2 * controlTwo.y +
            amount ** 3 * end.y,
        };
      };

      for (const side of [-1, 1]) {
        for (let branch = 0; branch < 13; branch += 1) {
          const spread = branch - 6;
          const start = {
            x: ctaEnergy.x + side * (140 + (branch % 3) * 5),
            y: ctaEnergy.y + spread * 2.8,
          };
          const end = {
            x: ctaEnergy.x + side * (255 + (branch % 4) * 24),
            y: ctaEnergy.y + spread * 18 + Math.sin(branch * 1.7) * 12,
          };
          const controlOne = {
            x: ctaEnergy.x + side * 176,
            y: start.y + Math.sin(branch * 2.1) * 16,
          };
          const controlTwo = {
            x: ctaEnergy.x + side * (214 + (branch % 3) * 16),
            y: lerp(start.y, end.y, 0.72) + Math.cos(branch * 1.35) * 13,
          };
          const branchAlpha = visualStrength * (0.16 + (branch % 4) * 0.035);

          context.beginPath();
          context.moveTo(start.x, start.y);
          context.bezierCurveTo(
            controlOne.x,
            controlOne.y,
            controlTwo.x,
            controlTwo.y,
            end.x,
            end.y
          );
          context.strokeStyle = `rgba(186, 118, 255, ${branchAlpha})`;
          context.lineWidth = branch % 5 === 0 ? 1.15 : 0.7;
          context.stroke();

          const twigStart = cubicPoint(start, controlOne, controlTwo, end, 0.56);
          const twigEnd = {
            x: twigStart.x + side * (36 + (branch % 3) * 12),
            y: twigStart.y + (branch % 2 === 0 ? -1 : 1) * (22 + (branch % 4) * 5),
          };
          context.beginPath();
          context.moveTo(twigStart.x, twigStart.y);
          context.quadraticCurveTo(
            twigStart.x + side * 20,
            twigStart.y + (branch % 2 === 0 ? -10 : 10),
            twigEnd.x,
            twigEnd.y
          );
          context.strokeStyle = `rgba(169, 132, 227, ${branchAlpha * 0.72})`;
          context.lineWidth = 0.55;
          context.stroke();

          const travel = 1 - ((clock * 0.00038 + branch * 0.091 + (side === 1 ? 0.17 : 0)) % 1);
          const signal = cubicPoint(start, controlOne, controlTwo, end, travel);
          const signalAlpha = visualStrength * (0.48 + strength * 0.42);
          if (branch % 3 === 0) drawGlow(signal.x, signal.y, 9 + strength * 5, signalAlpha * 0.36);
          context.fillStyle = `rgba(222, 184, 255, ${signalAlpha})`;
          context.beginPath();
          context.arc(signal.x, signal.y, branch % 4 === 0 ? 2 : 1.2, 0, TWO_PI);
          context.fill();
        }
      }

      drawGlow(ctaEnergy.x - 142, ctaEnergy.y, 30 + strength * 20, 0.24 * visualStrength);
      drawGlow(ctaEnergy.x + 142, ctaEnergy.y, 30 + strength * 20, 0.24 * visualStrength);
      context.restore();
    };

    const render = (clock: number, activeGeneration: number) => {
      if (activeGeneration !== generation) return;
      currentClock = clock;
      ctaEnergy.strength += (ctaEnergy.targetStrength - ctaEnergy.strength) * 0.085;
      const elapsed = (clock - startedAt) % LOOP_DURATION;
      const fadeOut = 1 - easeInOutCubic((elapsed - 29_000) / 900);
      const visualExit = easeInOutCubic((elapsed - 27_400) / 900);
      const sceneVisibility = fadeOut * (1 - visualExit);
      const pointProgress = easeOutCubic(elapsed / 900);
      const sparkRays = easeOutCubic((elapsed - 1_900) / 1_900);
      const sparkRaysFade = easeInOutCubic((elapsed - 5_800) / 1_100);
      const ambientProgress = easeOutCubic((elapsed - 4_200) / 1_500);
      const growth = easeOutCubic((elapsed - 5_100) / 3_100);
      const dataIn = easeOutCubic((elapsed - 8_200) / 800);
      const dataOut = easeInOutCubic((elapsed - 11_700) / 1_050);
      const dataActivity = dataIn * (1 - dataOut);
      const rootRadianceIn = easeInOutCubic((elapsed - 8_600) / 1_300);
      const rootRadianceOut = easeInOutCubic((elapsed - 12_300) / 900);
      const rootRadiance = rootRadianceIn * (1 - rootRadianceOut);
      const constellationProgress = easeOutCubic((elapsed - 5_600) / 2_300) * sceneVisibility;
      const constellationFlare = easeInOutCubic((elapsed - 8_900) / 1_800) * (1 - easeInOutCubic((elapsed - 24_600) / 1_200));
      currentFoundationProgress = easeInOutCubic((elapsed - 11_100) / 1_500);
      const skylineProgress = easeInOutCubic((elapsed - 12_200) / 2_300) * sceneVisibility;
      const dashboardIn = easeOutCubic((elapsed - 15_100) / 900);
      const dashboardOut = easeInOutCubic((elapsed - 20_100) / 900);
      const dashboardVisual = dashboardIn * (1 - dashboardOut) * sceneVisibility;
      const trendProgress = easeOutCubic((elapsed - 20_700) / 1_700);
      const trendExit = easeInOutCubic((elapsed - 25_700) / 750);
      const morph = easeInOutCubic((elapsed - 21_100) / 1_900);
      const arrowAura = easeInOutCubic((elapsed - 22_250) / 1_650) * sceneVisibility;
      const arrowCharge = easeInOutCubic((elapsed - 24_300) / 2_100);
      const impactBurst = easeOutCubic((elapsed - 26_800) / 580);
      const impactFade = easeInOutCubic((elapsed - 27_700) / 1_050);
      const arrowDissolve = easeOutCubic((elapsed - 26_650) / 300);
      const networkFocus = lerp(1, 0.24, trendProgress * (1 - morph));
      const networkAlpha = sceneVisibility * networkFocus;
      const foundationTransition = easeOutCubic(clamp(skylineProgress * 2.1));
      const cityFoundationFade = lerp(1, 0.72, foundationTransition * (1 - morph));
      const dashboardCount = easeOutCubic((elapsed - 15_100) / 950);

      const phase =
        elapsed < 2_700
          ? "spark"
          : elapsed < 5_100
            ? "connections"
            : elapsed < 8_200
              ? "network"
              : elapsed < 12_200
                ? "data"
                : elapsed < 15_100
                  ? "city"
                  : elapsed < 20_700
                    ? "dashboard"
                    : elapsed < 24_300
                      ? "arrow"
                      : elapsed < 26_800
                        ? "charge"
                        : elapsed < 28_200
                          ? "impact"
                          : "continuity";

      if (phase !== lastPhase) {
        parent.dataset.heroPhase = phase;
        lastPhase = phase;
      }

      if (dashboardGrowthRef.current) dashboardGrowthRef.current.textContent = `+${Math.round(84 * dashboardCount)}%`;
      if (dashboardRoiRef.current) dashboardRoiRef.current.textContent = `${(4.7 * dashboardCount).toFixed(1)}x`;
      if (dashboardRevenueRef.current) dashboardRevenueRef.current.textContent = `+${Math.round(126 * dashboardCount)}k`;

      context.clearRect(0, 0, scene.width, scene.height);

      for (const star of scene.stars) {
        const twinkle = 0.68 + Math.sin(clock * 0.0012 + star.phase) * 0.32;
        const gatherSide = star.phase > Math.PI ? -1 : 1;
        const gatherLane = Math.sin(star.phase * 2.6) * (54 + star.y * 70);
        const starX = lerp(
          star.x * scene.width,
          ctaEnergy.x + gatherSide * (150 + star.x * 190),
          ctaEnergy.strength * 0.66
        );
        const starY = lerp(
          star.y * scene.height,
          ctaEnergy.y + gatherLane,
          ctaEnergy.strength * 0.66
        );
        context.fillStyle = `rgba(172, 125, 255, ${star.alpha * twinkle * ambientProgress * sceneVisibility})`;
        context.beginPath();
        context.arc(starX, starY, star.radius * (1 + ctaEnergy.strength * 0.45), 0, TWO_PI);
        context.fill();
      }

      drawSkyline(skylineProgress * (1 - ctaEnergy.strength * 0.82), clock);
      drawSparkRays(sparkRays, sparkRaysFade, clock);
      drawLeftDataDust(Math.max(ambientProgress, growth * 0.72) * sceneVisibility * (1 - arrowDissolve), clock);
      drawConstellationWeb(constellationProgress, constellationFlare, clock, morph, elapsed);

      const root = pointAt(scene.nodes[0], morph, 0);
      const rootPulse = 0.62 + Math.sin(clock * 0.0048) * 0.38;
      const rootRadius = (lerp(14, 31, pointProgress) + rootRadiance * 58) * (0.78 + rootPulse * 0.36);
      drawGlow(root.x, root.y, rootRadius, clamp((0.56 + rootPulse * 0.34 + rootRadiance * 0.36) * pointProgress * networkAlpha));
      if (rootRadiance > 0.02) {
        drawGlow(root.x, root.y, 34 + rootRadiance * 72, 0.42 * rootRadiance * networkAlpha);
      }
      context.fillStyle = `rgba(255, 240, 255, ${clamp(pointProgress * networkAlpha * (0.65 + rootPulse * 0.35 + rootRadiance * 0.5))})`;
      context.beginPath();
      context.arc(root.x, root.y, 1.5 + pointProgress * 1.8 + rootRadiance * 1.6, 0, TWO_PI);
      context.fill();

      context.save();
      context.globalCompositeOperation = "lighter";

      for (const edge of scene.edges) {
        const edgeProgress = clamp(growth * 7.2 - (edge.depth - 1));
        if (edgeProgress <= 0) continue;

        const from = pointAt(scene.nodes[edge.from], morph, edge.from);
        const to = pointAt(scene.nodes[edge.to], morph, edge.to);
        const endX = lerp(from.x, to.x, easeOutCubic(edgeProgress));
        const endY = lerp(from.y, to.y, easeOutCubic(edgeProgress));
        const edgeMask = edge.from === 0 ? 1 : Math.min(networkMask(from), networkMask({ x: endX, y: endY }));
        if (edgeMask <= 0.02) continue;
        const gradient = context.createLinearGradient(from.x, from.y, endX, endY);
        const edgeBrightness = 1 + arrowCharge * morph * 1.7;
        const edgeAlpha = networkAlpha * cityFoundationFade * (1 - arrowDissolve) * edgeMask;
        gradient.addColorStop(0, `rgba(84, 184, 255, ${clamp(0.22 * edgeAlpha * edgeBrightness)})`);
        gradient.addColorStop(1, `rgba(205, 139, 255, ${clamp(0.74 * edgeAlpha * edgeBrightness)})`);

        context.beginPath();
        context.moveTo(from.x, from.y);
        const bendX = (from.x + endX) / 2 + (endY - from.y) * 0.06;
        const bendY = (from.y + endY) / 2 - (endX - from.x) * 0.035;
        context.quadraticCurveTo(bendX, bendY, endX, endY);
        context.strokeStyle = gradient;
        context.lineWidth = morph > 0.75 ? 0.9 + arrowCharge * 0.9 : 0.65;
        context.stroke();
      }

      scene.nodes.forEach((node, index) => {
        const visible = index === 0 ? pointProgress : clamp(growth * 7.2 - (node.depth - 0.7));
        if (visible <= 0) return;
        const point = pointAt(node, morph, index);
        const pulse = 0.78 + Math.sin(clock * 0.003 + index * 1.7) * 0.22;
        const pointMask = index === 0 || node.depth <= 1.2 ? 1 : networkMask(point);
        if (pointMask <= 0.02) return;
        const highlightedNode = index > 0 && (index % 9 === 0 || index % 17 === 0);
        const highlightProgress = easeInOutCubic((elapsed - 7_100) / 1_350);
        const highlightPulse = highlightedNode ? highlightProgress * (0.7 + Math.sin(clock * 0.0045 + index) * 0.3) : 0;
        const nodeAlpha = networkAlpha * cityFoundationFade * (1 - arrowDissolve) * pointMask;
        if (highlightedNode || index % 7 === 0) {
          drawGlow(
            point.x,
            point.y,
            (highlightedNode ? 18 : 11) + arrowCharge * morph * 13,
            clamp((highlightedNode ? 0.42 : 0.23) * visible * nodeAlpha * (1 + highlightPulse + arrowCharge * 1.7))
          );
        }
        context.fillStyle = highlightedNode
          ? `rgba(255, 244, 255, ${clamp(visible * nodeAlpha * (0.82 + highlightPulse * 0.72))})`
          : `rgba(221, 177, 255, ${clamp(visible * pulse * nodeAlpha * (1 + arrowCharge * morph * 1.5))})`;
        context.beginPath();
        context.arc(point.x, point.y, node.radius * (highlightedNode ? 1.72 + highlightPulse * 0.35 : 1 + morph * 0.32), 0, TWO_PI);
        context.fill();
      });

      if (dataActivity > 0 && growth > 0.9) {
        const dataCount = scene.compact ? 34 : 60;
        for (let index = 0; index < dataCount; index += 1) {
          const edge = scene.edges[(index * 13 + 7) % scene.edges.length];
          const from = pointAt(scene.nodes[edge.from], morph, edge.from);
          const to = pointAt(scene.nodes[edge.to], morph, edge.to);
          const travel = (clock * 0.00032 + index * 0.173) % 1;
          const x = lerp(from.x, to.x, travel);
          const y = lerp(from.y, to.y, travel);
          const dataMask = networkMask({ x, y });
          if (dataMask <= 0.02) continue;
          const hotNode = index % 6 === 0;
          const activity = dataActivity * networkAlpha * cityFoundationFade * (1 - arrowDissolve) * dataMask * (0.62 + Math.sin(index * 2.4 + clock * 0.004) * 0.34);
          drawGlow(x, y, hotNode ? 14 : 8.5, activity * (hotNode ? 0.74 : 0.48));
          context.fillStyle = hotNode
            ? `rgba(250, 239, 255, ${activity})`
            : `rgba(105, 219, 255, ${activity})`;
          context.beginPath();
          context.arc(x, y, hotNode ? 2.75 : index % 5 === 0 ? 1.85 : 1.15, 0, TWO_PI);
          context.fill();
        }
      }

      drawDashboard(dashboardVisual, dashboardOut, clock);
      drawGrowthTrend(trendProgress * sceneVisibility * (1 - arrowDissolve), trendExit, clock);
      drawArrowAura(arrowAura * (1 - ctaEnergy.strength * 0.9) * (1 - arrowDissolve), arrowCharge, clock);
      drawImpact(impactBurst, impactFade, clock);
      drawCtaEnergy(clock);
      context.restore();

      if (isVisible) {
        frame = requestAnimationFrame((nextClock) => render(nextClock, activeGeneration));
      }
    };

    const restartAnimation = () => {
      generation += 1;
      cancelAnimationFrame(frame);
      startedAt = performance.now();
      dashboardAnimationElements.forEach((element) => {
        element.style.animation = "none";
      });
      void parent.offsetWidth;
      dashboardAnimationElements.forEach((element) => {
        element.style.removeProperty("animation");
      });
      const activeGeneration = generation;
      frame = requestAnimationFrame((clock) => render(clock, activeGeneration));
    };

    const handleCtaEnergy = (event: Event) => {
      const detail = (event as CustomEvent<{ strength?: number; x?: number; y?: number }>).detail;
      ctaEnergy.targetStrength = clamp(detail?.strength ?? 0);
      if (typeof detail?.x === "number") ctaEnergy.x = detail.x;
      if (typeof detail?.y === "number") ctaEnergy.y = detail.y;
    };

    const handleDocumentVisibility = () => {
      if (document.visibilityState === "hidden") {
        isVisible = false;
        cancelAnimationFrame(frame);
        return;
      }

      isVisible = isIntersecting;
      if (isVisible) restartAnimation();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      isVisible = isIntersecting && document.visibilityState === "visible";
      if (isVisible) restartAnimation();
      else cancelAnimationFrame(frame);
    });
    resizeObserver.observe(parent);
    visibilityObserver.observe(parent);
    window.addEventListener("sts:energy-cta", handleCtaEnergy);
    document.addEventListener("visibilitychange", handleDocumentVisibility);
    restartAnimation();

    return () => {
      generation += 1;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("sts:energy-cta", handleCtaEnergy);
      document.removeEventListener("visibilitychange", handleDocumentVisibility);
    };
  }, []);

  return (
    <div className="hero-network-background pointer-events-none absolute inset-0 z-0 overflow-hidden" data-hero-phase="spark" aria-hidden="true">
      <div className="hero-network-background__nebula" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="hero-network-background__shade" />
      <div className="hero-network-background__grid" />
      <div className="hero-dashboard-satellite hero-dashboard-satellite--trend">
        <div className="hero-dashboard-satellite__header"><span>Sales graph</span><i /></div>
        <div className="hero-dashboard-satellite__line" aria-hidden="true">
          {[22, 34, 44, 39, 56, 68, 78, 92].map((height, index) => (
            <i className="hero-dashboard-bar" key={`${height}-${index}`} style={{ "--bar-height": `${height}%`, "--bar-index": index } as React.CSSProperties} />
          ))}
          <svg viewBox="0 0 132 62" preserveAspectRatio="none" aria-hidden="true">
            <path className="hero-dashboard-line" d="M2 56 C18 48 25 52 39 38 S61 36 74 24 S99 20 130 5" />
          </svg>
        </div>
        <div className="hero-dashboard-satellite__rows" aria-hidden="true">
          <span><i /> Funnel analysis</span>
          <span><i /> Revenue channels</span>
        </div>
      </div>
      <div className="hero-dashboard-satellite hero-dashboard-satellite--stack">
        <div className="hero-dashboard-stack__row"><i /> <span>Market signals</span></div>
        <div className="hero-dashboard-stack__row"><i /> <span>Audience growth</span></div>
        <div className="hero-dashboard-stack__row"><i /> <span>Campaign lift</span></div>
        <strong>+38.6%</strong>
      </div>
      <div className="hero-dashboard-stage">
        <div className="hero-dashboard-stage__header">
          <span>STS</span>
          <i />
        </div>
        <div className="hero-dashboard-stage__body">
          <div className="hero-dashboard-list" aria-hidden="true">
            <span><i /> Growth intelligence</span>
            <span><i /> Live data stream</span>
          </div>
          <div className="hero-dashboard-ring" aria-hidden="true">
            <strong ref={dashboardRoiRef}>0.0x</strong>
          </div>
          <div className="hero-dashboard-chart">
            <div className="hero-dashboard-chart__grid" />
            <div className="hero-dashboard-bars" aria-hidden="true">
              {[26, 42, 36, 58, 48, 70, 90, 62, 78].map((height, index) => (
                <i className="hero-dashboard-bar" key={`${height}-${index}`} style={{ "--bar-height": `${height}%`, "--bar-index": index } as React.CSSProperties} />
              ))}
            </div>
            <svg viewBox="0 0 180 90" preserveAspectRatio="none" aria-hidden="true">
              <path className="hero-dashboard-line" d="M4 76 C22 68 31 71 48 58 S73 61 91 42 S119 46 136 27 S157 25 176 10" />
              <circle cx="176" cy="10" r="2.5" />
            </svg>
          </div>
        </div>
        <div className="hero-dashboard-summary" aria-hidden="true">
          <span><small>Growth</small><b ref={dashboardGrowthRef}>+0%</b></span>
          <span><small>Revenue</small><b ref={dashboardRevenueRef}>+0k</b></span>
        </div>
        <div className="hero-dashboard-activity" aria-hidden="true">
          <span><i /> Connected boards</span>
          <div>{[38, 62, 47, 78, 56, 88, 70, 96].map((height, index) => <i key={`${height}-${index}`} style={{ height: `${height}%` }} />)}</div>
        </div>
      </div>
    </div>
  );
}
