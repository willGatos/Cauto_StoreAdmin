import { Attribute } from "@/@types/products";

export function searchCategories(
  categories: Attribute[],
  searchTerm: string
): Attribute[] {
  return categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });
}
