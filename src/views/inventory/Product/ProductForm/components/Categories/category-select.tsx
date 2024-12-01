import * as React from "react"
import { Search, X, ChevronDown } from 'lucide-react'
import { Category } from "./mock"
import { processCategories, flattenCategories, searchCategories } from "@/lib/utils/process-categories"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CategorySelectProps {
  categories: Category[]
  onSelectionChange: (selectedCategories: Category[]) => void
}

export function CategorySelect({ categories, onSelectionChange }: CategorySelectProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set())
  const [open, setOpen] = React.useState(false)
  const processedCategories = React.useMemo(() => processCategories(categories), [categories])
  
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return processedCategories
    return searchCategories(processedCategories, searchTerm)
  }, [processedCategories, searchTerm])

  const selectedCategories = React.useMemo(() => {
    const allCategories = flattenCategories(categories)
    return allCategories.filter(c => selectedIds.has(c.id))
  }, [categories, selectedIds])

  const handleSelect = (category: Category) => {
    const newSelectedIds = new Set(selectedIds)
    if (selectedIds.has(category.id)) {
      newSelectedIds.delete(category.id)
    } else {
      newSelectedIds.add(category.id)
    }
    setSelectedIds(newSelectedIds)
    onSelectionChange(selectedCategories)
  }

  const renderCategory = (category: Category) => {
    const paddingLeft = category.level ? category.level * 20 : 0
    
    return (
      <div key={category.id} className="category-item">
        <div 
          className="flex items-center gap-2 py-2 px-3 hover:bg-accent rounded-sm cursor-pointer" 
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => handleSelect(category)}
        >
          <Checkbox 
            checked={selectedIds.has(category.id)}
            onChange={() => handleSelect(category)}
          />
          <span className="text-sm">{category.name}</span>
        </div>
        {category.children && category.children.map(child => renderCategory(child))}
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[2.5rem] px-3 py-2"
        >
          <div className="flex flex-wrap gap-1 items-center max-w-[calc(100%-2rem)]">
            {selectedCategories.length > 0 ? (
              <>
                <ScrollArea className="w-full max-h-20">
                  <div className="flex flex-wrap gap-1">
                    {selectedCategories.map(category => (
                      <Badge key={category.id} className="mr-1">
                        {category.name}
                        <button
                          className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSelect(category)
                            }
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleSelect(category)
                          }}
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <span className="text-muted-foreground">Seleccionar categorías...</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-[350px] p-0">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          {filteredCategories.map(category => renderCategory(category))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
