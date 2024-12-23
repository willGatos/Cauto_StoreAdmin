import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { Loader2 } from "lucide-react";

interface CreateGalleryProps {
  onAddGallery: (name: string) => Promise<void>;
  isLoading: boolean;
}

export default function CreateGallery({
  onAddGallery,
  isLoading,
}: CreateGalleryProps) {
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddGallery = async () => {
    if (newGalleryTitle.trim()) {
      await onAddGallery(newGalleryTitle.trim());
      setNewGalleryTitle("");
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Button variant="default" onClick={() => setIsDialogOpen(true)}>
      Crear Nueva Galería
      </Button>
      <Dialog onClose={() => setIsDialogOpen(false)} isOpen={isDialogOpen}>
        <div>
          <Input
            type="text"
            value={newGalleryTitle}
            onChange={(e) => setNewGalleryTitle(e.target.value)}
            placeholder="Nombre de la Nueva Galería"
          />
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="default" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddGallery} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
