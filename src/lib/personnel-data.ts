export type PersonnelRow = {
  no: string;
  nama: string;
  tempatTanggalLahir: string;
  pangkat: string;
  pangkatTmt: string;
  korps: string;
  jurusan: string;
  nrpNip: string;
  jabatan: string;
  jawatan: string;
};

export type PersonnelCategory = {
  slug: string;
  title: string;
  label: string;
  rows: PersonnelRow[];
};

export const personnelCategories: PersonnelCategory[] = [
  {
    slug: "perwira",
    title: "Perwira",
    label: "Data Personel Perwira",
    rows: [],
  },
  {
    slug: "bintara",
    title: "Bintara",
    label: "Data Personel Bintara",
    rows: [],
  },
  {
    slug: "tamtama",
    title: "Tamtama",
    label: "Data Personel Tamtama",
    rows: [],
  },
  {
    slug: "pns",
    title: "PNS",
    label: "Data Personel PNS",
    rows: [],
  },
];

export function getPersonnelCategory(slug: string) {
  return personnelCategories.find((category) => category.slug === slug);
}
