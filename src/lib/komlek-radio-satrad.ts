import type {
  EditableTableColumn,
  EditableTableDefaultRow,
} from "@/lib/portal-editable-tables";

export type KomlekRadioCategory = "HF" | "UHF" | "VHF" | "VDCS";

export type KomlekRadioUnit = {
  key: string;
  title: string;
  group: "SATRAD" | "SATRUDAL";
  unitSlug: string;
};

export const komlekRadioCategories: KomlekRadioCategory[] = [
  "HF",
  "UHF",
  "VHF",
  "VDCS",
];

export const komlekRadioUnits: KomlekRadioUnit[] = [
  { key: "401", title: "401", group: "SATRAD", unitSlug: "401-tkt" },
  { key: "402", title: "402", group: "SATRAD", unitSlug: "402-cbl" },
  { key: "403", title: "403", group: "SATRAD", unitSlug: "403-tgl" },
  { key: "404", title: "404", group: "SATRAD", unitSlug: "404-cgt" },
  { key: "405", title: "405", group: "SATRAD", unitSlug: "405-plo" },
  { key: "406", title: "406", group: "SATRAD", unitSlug: "406-nli" },
  { key: "407", title: "407", group: "SATRAD", unitSlug: "407-tla" },
  { key: "421", title: "421", group: "SATRUDAL", unitSlug: "421-tga" },
];

export const komlekRadioTableKey = "komlek-radio-satrad";

export const komlekRadioColumns: EditableTableColumn[] = [
  { key: "category", label: "Radio" },
  ...komlekRadioUnits.map((unit) => ({
    key: unit.key,
    label:
      unit.group === "SATRUDAL"
        ? `Satrudal ${unit.title}`
        : `Satrad ${unit.title}`,
  })),
];

export const komlekRadioDefaultRows: EditableTableDefaultRow[] =
  komlekRadioCategories.map((category) => ({
    rowKey: `radio-${category.toLowerCase()}`,
    cells: Object.fromEntries([
      ["category", category],
      ...komlekRadioUnits.map((unit) => [unit.key, ""]),
    ]),
  }));

export const unitKomlekRadioColumns: EditableTableColumn[] = [
  { key: "category", label: "Radio" },
  { key: "details", label: "Keterangan" },
];

export const unitKomlekRadioDefaultRows: EditableTableDefaultRow[] =
  komlekRadioCategories.map((category) => ({
    rowKey: `radio-${category.toLowerCase()}`,
    cells: {
      category,
      details: "",
    },
  }));

export function getUnitKomlekRadioTableKey(unitSlug: string) {
  return `unit:${unitSlug}:komlek:kesiapan-radio-satrad`;
}