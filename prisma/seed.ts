import "dotenv/config";

import { prisma } from "../src/lib/prisma";
import { DEFAULT_ORGANIZATION_STRUCTURE } from "../src/lib/organization-structure";

type MenuSeed = {
  menuNumber: number;
  title: string;
  slug: string;
  type: "ORGANIZATION" | "UNIT_GROUP";
  logoUrl: string;
  displayOrder: number;
};

type UnitSeed = {
  menuNumber: number;
  code: string;
  slug: string;
  name: string;
  equipmentName: string;
  displayOrder: number;
};

const menuSeeds: MenuSeed[] = [
  {
    menuNumber: 1,
    title: "KOSEK IV",
    slug: "KOSEK IV",
    type: "ORGANIZATION",
    logoUrl: "/images/logos/logo-kosek IV.png",
    displayOrder: 1,
  },
  {
    menuNumber: 2,
    title: "Satrad 401 TKT",
    slug: "satrad-401-tkt",
    type: "UNIT_GROUP",
    logoUrl: "/images/logos/logo 401.png",
    displayOrder: 2,
  },
  {
    menuNumber: 3,
    title: "Satrad 402 CBL",
    slug: "satrad-402-cbl",
    type: "UNIT_GROUP",
    logoUrl: "/images/logos/logo 402.png",
    displayOrder: 3,
  },
  {
    menuNumber: 4,
    title: "Satrad 403 TGL",
    slug: "satrad-403-tgl",
    type: "UNIT_GROUP",
    logoUrl: "/images/logos/logo 403.png",
    displayOrder: 4,
  },
   {
    menuNumber: 5,
    title: "Satrudal 421 TGA",
    slug: "satrudal-421-tga",
    type: "UNIT_GROUP",
    logoUrl: "/images/logos/logo 421.png",
    displayOrder: 5,
  },
  {
    menuNumber: 6,
    title: "Satrad 405 PLO",
    slug: "satrad-405-plo",
    type: "UNIT_GROUP",
    logoUrl: "/images/logos/logo 405.png",
    displayOrder: 6,
  },
  {
    menuNumber: 7,
    title: "Satrad 406 NLI",
    slug: "satrad-406",
    type: "UNIT_GROUP",
    logoUrl: "/images/logos/logo 406.png",
    displayOrder: 7,
  },
  {
    menuNumber: 8,
    title: "Satrad 404 CGT",
    slug: "satrad-404-cgt",
    type: "UNIT_GROUP",
    logoUrl: "/images/logos/logo 404.png",
    displayOrder: 8,
  },
];

const unitSeeds: UnitSeed[] = [
  {
    menuNumber: 2,
    code: "401 TKT",
    slug: "401-tkt",
    name: "401 TKT",
    equipmentName: "Thomson TRS 2230 D",
    displayOrder: 1,
  },
  {
    menuNumber: 3,
    code: "402 CBL",
    slug: "402-cbl",
    name: "402 CBL",
    equipmentName: "Thomson TRS 2215 D",
    displayOrder: 1,
  },
  {
    menuNumber: 4,
    code: "403 TGL",
    slug: "403-tgl",
    name: "403 TGL",
    equipmentName: "Plessey AWS-II",
    displayOrder: 1,
  },
  {
    menuNumber: 5,
    code: "404 CGT",
    slug: "404-cgt",
    name: "404 CGT",
    equipmentName: "Weibel MFSR 2100/45",
    displayOrder: 1,
  },
  {
    menuNumber: 6,
    code: "405 PLO",
    slug: "405-plo",
    name: "405 PLO",
    equipmentName: "Plessey AR-15",
    displayOrder: 1,
  },
  {
    menuNumber: 7,
    code: "406 NLI",
    slug: "406-nli",
    name: "406 NLI",
    equipmentName: "Plessey AWS II",
    displayOrder: 1,
  },
  {
    menuNumber: 7,
    code: "406 PACITAN",
    slug: "406-unit-pacitan",
    name: "406 Unit Pacitan",
    equipmentName: "Leonardo RAT31 DL/M",
    displayOrder: 2,
  },
  {
    menuNumber: 8,
    code: "421 TGA",
    slug: "421-tga",
    name: "Satrudal 421 TGA",
    equipmentName: "Sistem Rudal NASAMS",
    displayOrder: 1,
  },
];

async function seedMenus() {
  for (const menu of menuSeeds) {
    await prisma.menuLogo.upsert({
      where: {
        menuNumber: menu.menuNumber,
      },
      update: {
        title: menu.title,
        slug: menu.slug,
        type: menu.type,
        logoUrl: menu.logoUrl,
        displayOrder: menu.displayOrder,
        isActive: true,
      },
      create: {
        menuNumber: menu.menuNumber,
        title: menu.title,
        slug: menu.slug,
        type: menu.type,
        logoUrl: menu.logoUrl,
        displayOrder: menu.displayOrder,
        isActive: true,
      },
    });
  }
}

async function seedUnits() {
  const menus = await prisma.menuLogo.findMany({
    select: {
      id: true,
      menuNumber: true,
    },
  });

  const menuIdByNumber = new Map(
    menus.map((menu) => [menu.menuNumber, menu.id]),
  );

  for (const unit of unitSeeds) {
    const menuLogoId = menuIdByNumber.get(unit.menuNumber);

    if (!menuLogoId) {
      throw new Error(
        `Menu nomor ${unit.menuNumber} tidak ditemukan.`,
      );
    }

    await prisma.unit.upsert({
      where: {
        code: unit.code,
      },
      update: {
        slug: unit.slug,
        name: unit.name,
        equipmentName: unit.equipmentName,
        menuLogoId,
        displayOrder: unit.displayOrder,
        isActive: true,
      },
      create: {
        code: unit.code,
        slug: unit.slug,
        name: unit.name,
        equipmentName: unit.equipmentName,
        menuLogoId,
        displayOrder: unit.displayOrder,
        isActive: true,
      },
    });
  }
}

async function seedOrganizationStructure() {
  const positionIdByKey = new Map<string, string>();

  for (const position of DEFAULT_ORGANIZATION_STRUCTURE) {
    const storedPosition = await prisma.organizationPosition.upsert({
      where: {
        key: position.key,
      },
      update: {},
      create: {
        key: position.key,
        title: position.title,
        section: position.section,
        level: position.level,
        displayOrder: position.displayOrder,
        isVisible: true,
      },
      select: {
        id: true,
      },
    });

    positionIdByKey.set(position.key, storedPosition.id);
  }

  for (const position of DEFAULT_ORGANIZATION_STRUCTURE) {
    await prisma.organizationPosition.update({
      where: {
        key: position.key,
      },
      data: {
        parentId: position.parentKey
          ? positionIdByKey.get(position.parentKey) ?? null
          : null,
      },
    });
  }
}

async function main() {
  console.log("Menjalankan database seed...");

  await seedMenus();
  await seedUnits();
  await seedOrganizationStructure();

  const menuCount = await prisma.menuLogo.count();
  const unitCount = await prisma.unit.count();
  const organizationPositionCount = await prisma.organizationPosition.count();

  console.log("Seed selesai.");
  console.log(`Jumlah menu: ${menuCount}`);
  console.log(`Jumlah unit: ${unitCount}`);
  console.log(`Jumlah posisi organisasi: ${organizationPositionCount}`);
}

main()
  .catch((error: unknown) => {
    console.error("Database seed gagal.");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
