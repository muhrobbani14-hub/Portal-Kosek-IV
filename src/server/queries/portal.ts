import "server-only";

import { prisma } from "@/lib/prisma";

export async function getPortalMenus() {
  return prisma.menuLogo.findMany({
    where: {
      isActive: true,
    },

    orderBy: {
      displayOrder: "asc",
    },

    select: {
      id: true,
      menuNumber: true,
      title: true,
      slug: true,
      type: true,
      logoUrl: true,

      units: {
        where: {
          isActive: true,
        },

        orderBy: {
          displayOrder: "asc",
        },

        select: {
          id: true,
          code: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function getUnitBySlug(slug: string) {
  return prisma.unit.findFirst({
    where: {
      slug,
      isActive: true,
    },

    select: {
      id: true,
      code: true,
      slug: true,
      name: true,
      equipmentName: true,
      installationYear: true,
      psrCondition: true,
      psrRange: true,
      ssrCondition: true,
      ssrRange: true,
      description: true,
      imageUrl: true,

      menuLogo: {
        select: {
          title: true,
          slug: true,
        },
      },

      problems: {
        orderBy: [
          {
            displayOrder: "asc",
          },
          {
            occurredAt: "desc",
          },
        ],

        select: {
          id: true,
          title: true,
          description: true,
          occurredAt: true,
          imageUrl: true,
          status: true,

          actions: {
            orderBy: [
              {
                sequence: "asc",
              },
              {
                actionDate: "asc",
              },
            ],

            select: {
              id: true,
              actionDate: true,
              description: true,
              letterNumber: true,
              result: true,
              attachmentUrl: true,
            },
          },
        },
      },
    },
  });
}

export async function getUnitGroupByMenuSlug(
  menuSlug: string,
) {
  return prisma.menuLogo.findFirst({
    where: {
      slug: menuSlug,
      type: "UNIT_GROUP",
      isActive: true,
    },

    select: {
      id: true,
      title: true,
      slug: true,
      logoUrl: true,

      units: {
        where: {
          isActive: true,
        },

        orderBy: {
          displayOrder: "asc",
        },

        select: {
          id: true,
          code: true,
          name: true,
          slug: true,
          equipmentName: true,
          imageUrl: true,
        },
      },
    },
  });
}