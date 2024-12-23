import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Loader2 } from "lucide-react";

interface DeleteGalleryProps {
  gallery: { id: string; name: string };
  onDeleteGallery: (id: string) => Promise<void>;
  isLoading: boolean;
}

export default function DeleteGallery({
  gallery,
  onDeleteGallery,
  isLoading,
}: DeleteGalleryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteGallery = async () => {
    await onDeleteGallery(gallery.id);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button variant="default" onClick={() => setIsDialogOpen(true)}>
        Eliminar{" "}
      </Button>
      <Dialog onClose={() => setIsDialogOpen(false)} isOpen={isDialogOpen}>
        <div>
          <p>
            ¿Estás seguro de que deseas eliminar la galería "{gallery.name}"?
          </p>
          <p>Esta acción no se puede deshacer.</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="default" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleDeleteGallery}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Eliminar"
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
