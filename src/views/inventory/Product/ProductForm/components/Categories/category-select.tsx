import * as React from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Category } from "./mock";
import {
  processCategories,
  flattenCategories,
  searchCategories,
} from "./utils/index";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui";

interface CategorySelectProps {
  categories: Category[];
  onSelectionChange: (selectedCategories: Category[]) => void;
  setSelectedIds;
  selectedIds;
}

export function CategorySelect({
  categories,
  onSelectionChange,
  selectedIds,
  setSelectedIds,
}: CategorySelectProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const processedCategories = React.useMemo(
    () => processCategories(categories),
    [categories]
  );

  const filteredCategories = React.useMemo(() => {
    console.log("PROCESO", processedCategories);

    if (!searchTerm) return processedCategories;
    return searchCategories(processedCategories, searchTerm);
  }, [processedCategories, searchTerm]);

  const selectedCategories = React.useMemo(() => {
    const allCategories = flattenCategories(categories);
    return allCategories.filter((c) => selectedIds.has(c.id));
  }, [categories, selectedIds]);

  const handleSelect = (category: Category) => {
    const newSelectedIds = new Set(selectedIds);
    if (selectedIds.has(category.id)) {
      newSelectedIds.delete(category.id);
    } else {
      newSelectedIds.add(category.id);
    }
    setSelectedIds(newSelectedIds);
    onSelectionChange(selectedCategories);
  };

  const onDialogClose = (e: MouseEvent) => {
    console.log("onDialogClose", e);
    setOpen(false);
  };

  const onDialogOpen = () => {
    setOpen(true);
  };

  const renderCategory = (category: Category) => {
    const paddingLeft = category.level ? category.level * 20 : 0;

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
        {category.children &&
          category.children.map((child) => renderCategory(child))}
      </div>
    );
  };

  return (
    <>
      <Button
        type="button"
        variant="default"
        className="w-full flex items-center justify-between h-auto min-h-[2.5rem] px-3 py-2"
        onClick={() => onDialogOpen()}
      >
        <div className="flex flex-wrap gap-1 items-center max-w-[calc(100%-2rem)]">
          {selectedCategories.length > 0 ? (
            <>
              <div className="w-full max-h-20">
                <div className="flex flex-wrap gap-1">
                  {selectedCategories.map((category) => (
                    <Badge key={category.id} className="mr-1">
                      {category.name}
                      <button
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSelect(category);
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelect(category);
                        }}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <span className="text-muted-foreground">
              Seleccionar categorías...
            </span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
      <Dialog
        closable={true}
        onClose={onDialogClose}
        isOpen={open}
        className="w-full max-w-[350px] p-0 "
      >
        <div>
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="ml-3 h-[300px] overflow-scroll">
            {filteredCategories.map((category) => renderCategory(category))}
          </div>
        </div>
      </Dialog>
    </>
  );
}
