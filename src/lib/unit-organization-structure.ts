export type UnitOrganizationNode = {
  key: string;
  title: string;
  displayOrder: number;
};

export const UNIT_ORGANIZATION_STRUCTURE: UnitOrganizationNode[] = [
  { key: "DANSATRAD", title: "DANSATRAD", displayOrder: 1 },
  { key: "KASIOPS", title: "KASIOPS", displayOrder: 2 },
  { key: "KASIHAR", title: "KASIHAR", displayOrder: 3 },
  { key: "KASUBSI_MATUD", title: "KASUBSI MATUD", displayOrder: 4 },
  {
    key: "KASUBSIKOM_PERNIKA",
    title: "KASUBSIKOM PERNIKA",
    displayOrder: 5,
  },
  { key: "KASUBSI_DALLAT", title: "KASUBSI DALLAT", displayOrder: 6 },
  { key: "KASUBSI_ANT_TX", title: "KASUBSI ANT/TX", displayOrder: 7 },
  { key: "KASUBSI_RP", title: "KASUBSI R/P", displayOrder: 8 },
  { key: "KASUBSI_KOM", title: "KASUBSI KOM", displayOrder: 9 },
  { key: "KASUBSI_BANTEK", title: "KASUBSI BANTEK", displayOrder: 10 },
  {
    key: "KASUBSIKOMP_DISPLAY",
    title: "KASUBSIKOMP/DISPLAY",
    displayOrder: 11,
  },
  { key: "KAURTU", title: "KAURTU", displayOrder: 12 },
  { key: "KAURDAL", title: "KAURDAL", displayOrder: 13 },
  { key: "KASUBUR_BMN", title: "KASUBUR BMN", displayOrder: 14 },
  { key: "KA_TB", title: "KA-TB", displayOrder: 15 },
  { key: "KALAMJA", title: "KALAMJA", displayOrder: 16 },
  { key: "KAKANDI", title: "KAKANDI", displayOrder: 17 },
  { key: "KAKES", title: "KAKES", displayOrder: 18 },
];