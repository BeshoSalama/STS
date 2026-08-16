import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defaultAboutContent, defaultAvatar, defaultFounderPhoto, serializeAboutContent } from "../frontend/src/lib/content/about";
import { clientLogoImages } from "../frontend/src/lib/content/clientLogos";
import { valueProps } from "../frontend/src/lib/content/clients";
import { industries } from "../frontend/src/lib/content/industries";
import { siteConfig } from "../frontend/src/lib/content/nav";
import { customPackageBaseFee, packageAddOns, packagePlans } from "../frontend/src/lib/content/packages";
import { getProjectSlug, projects } from "../frontend/src/lib/content/projects";
import { clientStats, heroStats, platforms, resultCards } from "../frontend/src/lib/content/stats";
import { team } from "../frontend/src/lib/content/team";

const db = new PrismaClient();

const seededUsers = [
  { name: "STS Developer", email: "developer@sts.local", password: "Developer123456!", role: "DEVELOPER" },
  { name: "STS Admin", email: "admin@sts.local", password: "Admin123456!", role: "ADMIN" },
  { name: "STS Staff", email: "staff@sts.local", password: "Staff123456!", role: "STAFF" },
  { name: "STS Client", email: "client@sts.local", password: "Client123456!", role: "CLIENT" },
];

const retiredSeedEmails = [
  "developer1@sts.local",
  "developer2@sts.local",
  "developer3@sts.local",
  "admin1@sts.local",
  "admin2@sts.local",
  "admin3@sts.local",
  "staff1@sts.local",
  "staff2@sts.local",
  "staff3@sts.local",
  "client1@sts.local",
  "client2@sts.local",
  "client3@sts.local",
];

async function main() {
  for (const [order, project] of projects.entries()) {
    await db.project.upsert({
      where: { slug: getProjectSlug(project.name) },
      update: { ...project, order, published: true },
      create: { slug: getProjectSlug(project.name), ...project, order, published: true },
    });
  }

  for (const [order, industry] of industries.entries()) {
    const savedIndustry = await db.industry.upsert({
      where: { slug: industry.slug },
      update: {
        name: industry.name,
        icon: industry.icon,
        headline: industry.headline,
        description: industry.description,
        order,
      },
      create: {
        slug: industry.slug,
        name: industry.name,
        icon: industry.icon,
        headline: industry.headline,
        description: industry.description,
        order,
      },
    });

    await db.industryClient.deleteMany({ where: { industryId: savedIndustry.id } });
    for (const [clientOrder, client] of industry.clients.entries()) {
      await db.industryClient.create({
        data: { industryId: savedIndustry.id, name: client.name, result: client.result, order: clientOrder },
      });
    }
  }

  for (const [order, member] of team.entries()) {
    await db.teamMember.upsert({
      where: { id: `team-${order}` },
      update: { ...member, photo: member.photo || defaultAvatar, order },
      create: { id: `team-${order}`, ...member, photo: member.photo || defaultAvatar, order },
    });
  }

  await db.aboutPageContent.upsert({
    where: { id: 1 },
    update: serializeAboutContent({ ...defaultAboutContent, founderPhoto: defaultFounderPhoto }),
    create: { id: 1, ...serializeAboutContent({ ...defaultAboutContent, founderPhoto: defaultFounderPhoto }) },
  });

  for (const [order, plan] of packagePlans.entries()) {
    await db.packagePlan.upsert({
      where: { name: plan.name },
      update: {
        tagline: plan.tagline,
        price: plan.price,
        period: plan.period,
        description: plan.description,
        features: JSON.stringify(plan.features),
        cta: plan.cta,
        featured: Boolean(plan.featured),
        order,
      },
      create: {
        name: plan.name,
        tagline: plan.tagline,
        price: plan.price,
        period: plan.period,
        description: plan.description,
        features: JSON.stringify(plan.features),
        cta: plan.cta,
        featured: Boolean(plan.featured),
        order,
      },
    });
  }

  await db.packagePlan.upsert({
    where: { name: "Custom Package Base Fee" },
    update: {
      tagline: "Custom builder",
      price: `$${customPackageBaseFee}`,
      period: "/mo",
      description: "Base fee used by the server-side quote calculator.",
      features: JSON.stringify([]),
      cta: "Request This Package",
      featured: false,
      order: 999,
    },
    create: {
      name: "Custom Package Base Fee",
      tagline: "Custom builder",
      price: `$${customPackageBaseFee}`,
      period: "/mo",
      description: "Base fee used by the server-side quote calculator.",
      features: JSON.stringify([]),
      cta: "Request This Package",
      featured: false,
      order: 999,
    },
  });

  for (const [order, addOn] of packageAddOns.entries()) {
    await db.packageAddOn.upsert({
      where: { id: addOn.id },
      update: { label: addOn.label, description: addOn.description, price: addOn.price, order },
      create: { ...addOn, order },
    });
  }

  await db.manualPaymentSettings.upsert({
    where: { id: 1 },
    update: {
      vodafoneCashEnabled: true,
      vodafoneCashNumber: "01039839414",
      vodafoneCashSecondNumber: "01021804116",
      vodafoneCashInstructions:
        "Transfer the exact plan amount to one of the Vodafone Cash numbers, keep a screenshot, then submit the transfer details.",
      instapayEnabled: true,
      instapayAddress: "01021804116",
      instapayInstructions:
        "Transfer the exact plan amount to the InstaPay address, keep a screenshot, then submit the transfer details.",
    },
    create: {
      id: 1,
      vodafoneCashEnabled: true,
      vodafoneCashNumber: "01039839414",
      vodafoneCashSecondNumber: "01021804116",
      vodafoneCashAccountName: "",
      vodafoneCashInstructions:
        "Transfer the exact plan amount to one of the Vodafone Cash numbers, keep a screenshot, then submit the transfer details.",
      instapayEnabled: true,
      instapayAddress: "01021804116",
      instapayAccountName: "",
      instapayInstructions:
        "Transfer the exact plan amount to the InstaPay address, keep a screenshot, then submit the transfer details.",
    },
  });

  for (const [order, logo] of clientLogoImages.entries()) {
    await db.clientLogo.upsert({
      where: { id: `logo-${order}` },
      update: { ...logo, order, size: "md" },
      create: { id: `logo-${order}`, ...logo, order, size: "md" },
    });
  }

  for (const [order, prop] of valueProps.entries()) {
    await db.valueProp.upsert({
      where: { id: `value-${order}` },
      update: { ...prop, order },
      create: { id: `value-${order}`, ...prop, order },
    });
  }

  await db.heroStats.upsert({ where: { id: 1 }, update: heroStats, create: { id: 1, ...heroStats } });
  await db.clientStats.upsert({ where: { id: 1 }, update: clientStats, create: { id: 1, ...clientStats } });

  for (const [order, card] of resultCards.entries()) {
    await db.resultCard.upsert({
      where: { id: `result-${order}` },
      update: { ...card, order },
      create: { id: `result-${order}`, ...card, order },
    });
  }

  for (const [order, name] of platforms.entries()) {
    await db.platform.upsert({ where: { name }, update: { order }, create: { name, order } });
  }

  await db.siteSettings.upsert({
    where: { id: 1 },
    update: {
      phone: siteConfig.phone,
      address: siteConfig.address,
      mapUrl: siteConfig.mapUrl,
      socials: JSON.stringify(siteConfig.socials),
    },
    create: {
      id: 1,
      phone: siteConfig.phone,
      address: siteConfig.address,
      mapUrl: siteConfig.mapUrl,
      socials: JSON.stringify(siteConfig.socials),
    },
  });

  for (const user of seededUsers) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    await db.user.upsert({
      where: { email: user.email },
      update: { name: user.name, passwordHash, role: user.role, emailVerified: new Date() },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        emailVerified: new Date(),
        role: user.role,
      },
    });
  }

  await db.user.deleteMany({ where: { email: { in: retiredSeedEmails } } });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
