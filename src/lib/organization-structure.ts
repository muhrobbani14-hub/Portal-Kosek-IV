export type OrganizationSectionValue =
  | "PIMPINAN"
  | "STAF_PEMBANTU_PIMPINAN"
  | "STAF_PELAYANAN"
  | "PELAKSANA";

export type DefaultOrganizationNode = {
  key: string;
  title: string;
  section: OrganizationSectionValue;
  parentKey: string | null;
  level: number;
  displayOrder: number;
};

export type OrganizationPosition = DefaultOrganizationNode & {
  id?: string;
  subtitle?: string | null;
  name?: string | null;
  rank?: string | null;
  nrp?: string | null;
  birthPlace?: string | null;
  birthDate?: string | null;
  birthPlaceDate?: string | null;
  education?: string | null;
  careerHistory?: string | null;
  photoUrl?: string | null;
  isVisible?: boolean | null;
};

export const DEFAULT_ORGANIZATION_STRUCTURE: OrganizationPosition[] = [
  {
    key: "KOMANDAN",
    title: "KOMANDAN",
    section: "PIMPINAN",
    parentKey: null,
    level: 0,
    displayOrder: 1,
  },
  {
    key: "PASMIN",
    title: "PASMIN",
    section: "STAF_PEMBANTU_PIMPINAN",
    parentKey: "KOMANDAN",
    level: 1,
    displayOrder: 1,
  },
  {
    key: "ASINTEL",
    title: "ASINTEL",
    section: "STAF_PEMBANTU_PIMPINAN",
    parentKey: "PASMIN",
    level: 2,
    displayOrder: 1,
  },
  {
    key: "ASOPS",
    title: "ASOPS",
    section: "STAF_PEMBANTU_PIMPINAN",
    parentKey: "PASMIN",
    level: 2,
    displayOrder: 2,
  },
  {
    key: "ASPERS",
    title: "ASPERS",
    section: "STAF_PEMBANTU_PIMPINAN",
    parentKey: "PASMIN",
    level: 2,
    displayOrder: 3,
  },
  {
    key: "ASLOG",
    title: "ASLOG",
    section: "STAF_PEMBANTU_PIMPINAN",
    parentKey: "PASMIN",
    level: 2,
    displayOrder: 4,
  },
  {
    key: "ASKOMLEK",
    title: "ASKOMLEK",
    section: "STAF_PEMBANTU_PIMPINAN",
    parentKey: "PASMIN",
    level: 2,
    displayOrder: 5,
  },
  {
    key: "KAKUM",
    title: "KAKUM",
    section: "STAF_PELAYANAN",
    parentKey: null,
    level: 0,
    displayOrder: 1,
  },
  {
    key: "KAKU",
    title: "KAKU",
    section: "STAF_PELAYANAN",
    parentKey: null,
    level: 0,
    displayOrder: 2,
  },
  {
    key: "DANSATPROV",
    title: "DANSATPROV",
    section: "STAF_PELAYANAN",
    parentKey: null,
    level: 0,
    displayOrder: 3,
  },
  {
    key: "KAKES",
    title: "KAKES",
    section: "STAF_PELAYANAN",
    parentKey: null,
    level: 0,
    displayOrder: 4,
  },
  {
    key: "KAPENTAK",
    title: "KAPENTAK",
    section: "STAF_PELAYANAN",
    parentKey: null,
    level: 0,
    displayOrder: 5,
  },
  {
    key: "KAPOSEK",
    title: "KAPOSEK",
    section: "STAF_PELAYANAN",
    parentKey: null,
    level: 0,
    displayOrder: 6,
  },
  {
    key: "KAPROGAR",
    title: "KAPROGAR",
    section: "STAF_PELAYANAN",
    parentKey: null,
    level: 0,
    displayOrder: 7,
  },
  {
    key: "KASET",
    title: "KASET",
    section: "STAF_PELAYANAN",
    parentKey: null,
    level: 0,
    displayOrder: 8,
  },
  {
    key: "KALAMBANGJA",
    title: "KALAMBANGJA",
    section: "STAF_PELAYANAN",
    parentKey: null,
    level: 0,
    displayOrder: 9,
  },
  {
    key: "KOMANDAN_FLIGHTMA",
    title: "KOMANDAN FLIGHTMA",
    section: "STAF_PELAYANAN",
    parentKey: null,
    level: 0,
    displayOrder: 10,
  },
  {
    key: "KAGUDKAI",
    title: "KAGUDKAI",
    section: "STAF_PELAYANAN",
    parentKey: null,
    level: 0,
    displayOrder: 11,
  },
  {
    key: "KOMANDAN_SATKOMLEK",
    title: "KOMANDAN SATKOMLEK",
    section: "STAF_PELAYANAN",
    parentKey: null,
    level: 0,
    displayOrder: 12,
  },
  {
    key: "KAADA",
    title: "KAADA",
    section: "STAF_PELAYANAN",
    parentKey: null,
    level: 0,
    displayOrder: 13,
  },
  {
    key: "SATRAD_211",
    title: "SATRAD 211",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 1,
  },
  {
    key: "SATRAD_212",
    title: "SATRAD 212",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 2,
  },
  {
    key: "SATRAD_213",
    title: "SATRAD 213",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 3,
  },
  {
    key: "SATRAD_214",
    title: "SATRAD 214",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 4,
  },
  {
    key: "SATRAD_215",
    title: "SATRAD 215",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 5,
  },
  {
    key: "SATRAD_216",
    title: "SATRAD 216",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 6,
  },
  {
    key: "SATRUDAL_111",
    title: "SATRUDAL 111",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 7,
  },
  {
    key: "SATRAD_401",
    title: "SATRAD 401",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 8,
  },
  {
    key: "SATRAD_402",
    title: "SATRAD 402",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 9,
  },
  {
    key: "SATRAD_403",
    title: "SATRAD 403",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 10,
  },
  {
    key: "SATRUDAL_421",
    title: "SATRUDAL 421",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 11,
  },
  {
    key: "SATRAD_404",
    title: "SATRAD 404",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 12,
  },
  {
    key: "SATRAD_405",
    title: "SATRAD 405",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 13,
  },
  {
    key: "SATRAD_406",
    title: "SATRAD 406",
    section: "PELAKSANA",
    parentKey: null,
    level: 0,
    displayOrder: 14,
  },
];

export const organizationStructure = DEFAULT_ORGANIZATION_STRUCTURE;
