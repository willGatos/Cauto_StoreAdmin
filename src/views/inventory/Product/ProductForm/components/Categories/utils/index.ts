import { Category } from "../mock"

export function processCategories(categories: Category[], level = 0): Category[] {
  return categories.map(category => ({
    ...category,
    level,
    children: category.children ? processCategories(category.children, level + 1) : undefined
  }))
}

export function flattenCategories(categories: Category[]): Category[] {
  return categories.reduce<Category[]>((acc, category) => {
    acc.push(category)
    if (category.children) {
      acc.push(...flattenCategories(category.children))
    }
    return acc
  }, [])
}

export function searchCategories(categories: Category[], searchTerm: string): Category[] {
  return categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase())
    const hasMatchingChildren = category.children 
      ? searchCategories(category.children, searchTerm).length > 0 
      : false
    return matchesSearch || hasMatchingChildren
  })
}

