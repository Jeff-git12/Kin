export const SERVICE_CATEGORY_OPTIONS = [
  {
    value: "whats_new_around_town",
    label: "What's new around town",
    browseLabel: "What's New Around Town",
  },
  { value: "contractor", label: "Contractor", browseLabel: "Contractors" },
  { value: "tutor", label: "Tutor", browseLabel: "Tutors" },
  { value: "babysitter", label: "Babysitter", browseLabel: "Babysitters" },
  { value: "accountant", label: "Accountant", browseLabel: "Accountants" },
  { value: "restaurant", label: "Restaurant", browseLabel: "Restaurants" },
  { value: "vet", label: "Vet", browseLabel: "Vets" },
  {
    value: "house_cleaner",
    label: "House cleaner",
    browseLabel: "House Cleaners",
  },
  { value: "dog_walker", label: "Dog walker", browseLabel: "Dog Walkers" },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORY_OPTIONS)[number]["value"];
export type CategoryFilter = "all" | ServiceCategory;

const CATEGORY_LABEL_BY_VALUE: Record<ServiceCategory, string> =
  SERVICE_CATEGORY_OPTIONS.reduce(
    (acc, option) => {
      acc[option.value] = option.label;
      return acc;
    },
    {} as Record<ServiceCategory, string>,
  );

export function normalizeServiceCategory(raw: string): ServiceCategory | null {
  const normalizedRaw = raw.trim().toLowerCase();
  if (normalizedRaw === "dog walker") return "dog_walker";
  if (normalizedRaw === "house cleaner") return "house_cleaner";
  if (normalizedRaw === "what's new around town") return "whats_new_around_town";
  if (normalizedRaw === "whats new around town") return "whats_new_around_town";

  const candidate = normalizedRaw as ServiceCategory;
  return CATEGORY_LABEL_BY_VALUE[candidate] ? candidate : null;
}

export function getServiceCategoryLabel(raw: string): string {
  const normalized = normalizeServiceCategory(raw);
  if (!normalized) return raw;
  return CATEGORY_LABEL_BY_VALUE[normalized];
}
