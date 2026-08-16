import { db } from "@/lib/db";

type NotificationPayload = {
  type: string;
  title: string;
  body: string;
  href?: string | null;
};

export async function notifyUser(userId: string, payload: NotificationPayload) {
  return db.notification.create({
    data: {
      userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      href: payload.href ?? null,
    },
  });
}

export async function notifyRoles(roles: string[], payload: NotificationPayload) {
  const users = await db.user.findMany({
    where: { role: { in: roles } },
    select: { id: true },
  });
  if (users.length === 0) return { count: 0 };

  return db.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      href: payload.href ?? null,
    })),
  });
}
