import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface EditGalleryProps {
  gallery: { id: string; name: string };
  onEditGallery: (id: string, newName: string) => Promise<void>;
  isLoading: boolean;
}

export default function EditGallery({
  gallery,
  onEditGallery,
  isLoading,
}: EditGalleryProps) {
  const [editedName, setEditedName] = useState(gallery.name);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setEditedName(gallery.name);
  }, [gallery]);

  const handleEditGallery = async () => {
    if (editedName.trim() && editedName !== gallery.name) {
      await onEditGallery(gallery.id, editedName.trim());
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Button variant="default" onClick={() => setIsDialogOpen(true)}>
        Editar{" "}
      </Button>
      <Dialog onClose={() => setIsDialogOpen(false)} isOpen={isDialogOpen}>
        <div>
          <Input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder="Nombre de la Galería"
          />
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="default" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditGallery} disabled={isLoading}>
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
