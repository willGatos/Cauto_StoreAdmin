import * as React from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Attribute } from "@/@types/products";
import { searchCategories } from "./utils/index";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui";

interface AttributeSelectProps {
  attributes: Attribute[];
  onSelectionChange: (selectedCategories) => void;
  setSelectedIds;
  selectedIds;
}

export function AttributeSelect({
  attributes,
  onSelectionChange,
  selectedIds,
  setSelectedIds,
}: AttributeSelectProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return attributes;
    return searchCategories(attributes, searchTerm);
  }, [attributes, searchTerm]);

  const selectedCategories = React.useMemo(() => {
    return attributes.filter((c) => selectedIds.has(c.value));
  }, [attributes, selectedIds]);

  const handleSelect = (attribute) => {
    const newSelectedIds = new Set(selectedIds);
    console.log(attribute);
    if (selectedIds.has(attribute)) {
      newSelectedIds.delete(attribute);
    } else {
      newSelectedIds.add(attribute);
    }
    setSelectedIds(newSelectedIds);
    console.log("LOL", Array.from(newSelectedIds));
    onSelectionChange(Array.from(newSelectedIds));
  };

  const onDialogClose = (e: MouseEvent) => {
    console.log("onDialogClose", e);
    setOpen(false);
  };

  const onDialogOpen = () => {
    setOpen(true);
  };

  const renderAttribute = (attribute: Attribute) => {
    return (
      <div key={attribute.value}>
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-accent rounded-sm cursor-pointer"
          onClick={() => handleSelect(attribute.value)}
        >
          <Checkbox
            checked={selectedIds.has(attribute.value)}
            onChange={() => handleSelect(attribute.value)}
          />
          <span className="text-sm">{attribute.label}</span>
        </div>
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
                  {selectedCategories.map((attribute) => (
                    <Badge key={attribute.value} className="mr-1">
                      {attribute.name}
                      <button
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSelect(attribute);
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelect(attribute);
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
        className="w-full max-w-[350px] p-0"
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
            {filteredCategories.map((attribute) => renderAttribute(attribute))}
          </div>
        </div>
      </Dialog>
    </>
  );
}
