import { Loader2 } from 'lucide-react';
import CreateGallery from "./CRUD/Create";
import DeleteGallery from "./CRUD/Delete";
import EditGallery from "./CRUD/Edit";

interface Gallery {
  id: string;
  name: string;
}

interface GalleryListProps {
  galleries: Gallery[];
  onSelectGallery: (gallery: Gallery) => void;
  onAddGallery: (name: string) => Promise<void>;
  onEditGallery: (id: string, newName: string) => Promise<void>;
  onDeleteGallery: (id: string) => Promise<void>;
  isLoading: boolean;
}

export default function GalleryList({
  galleries,
  onSelectGallery,
  onAddGallery,
  onEditGallery,
  onDeleteGallery,
  isLoading,
}: GalleryListProps) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4">
        {isLoading ? (
          <div className="flex justify-center items-center w-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : galleries.length === 0 ? (
          <p className="text-gray-500">No hay galerías disponibles.</p>
        ) : (
          galleries.map((gallery) => (
            <div key={gallery.id} className="flex items-center gap-2">
              <button
                onClick={() => onSelectGallery(gallery)}
                className="flex-grow sm:flex-grow-0 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md border border-gray-300 transition"
              >
                {gallery.name}
              </button>
              <EditGallery gallery={gallery} onEditGallery={onEditGallery} isLoading={isLoading} />
              <DeleteGallery gallery={gallery} onDeleteGallery={onDeleteGallery} isLoading={isLoading} />
            </div>
          ))
        )}
      </div>
      <CreateGallery onAddGallery={onAddGallery} isLoading={isLoading} />
    </div>
  );
}

