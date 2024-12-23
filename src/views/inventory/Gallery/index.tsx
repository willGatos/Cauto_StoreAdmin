import React, { useState, useEffect } from "react";
import supabase from "@/services/Supabase/BaseClient";
import GalleryList from "./GalleryList";
import ImageList from "./ImageList";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import UploadWidget from "../Product/ProductForm/components/Images";

export default function GalleryManager() {
  const [galleries, setGalleries] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);

  useEffect(() => {
    fetchGalleries();
  }, []);

  useEffect(() => {
    if (selectedGallery) {
      fetchImages(selectedGallery.id);
    }
  }, [selectedGallery]);

  async function fetchGalleries() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from("galleries").select("*");
      if (error) throw error;
      setGalleries(data);
    } catch (error) {
      console.error("Error al obtener galerías:", error);
      setError(
        "No se pudieron cargar las galerías. Por favor, intente de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchImages(galleryId) {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("galleries_images")
        .select("*")
        .eq("gallery_id", galleryId);
      if (error) throw error;
      setLocalImages(data);
    } catch (error) {
      console.error("Error al obtener imágenes:", error);
      setError(
        "No se pudieron cargar las imágenes. Por favor, intente de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function addGallery(name) {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("galleries")
        .insert([{ name }]);
      if (error) throw error;
      fetchGalleries();
    } catch (error) {
      console.error("Error al añadir galería:", error);
      setError("No se pudo añadir la galería. Por favor, intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  async function editGallery(id, newName) {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("galleries")
        .update({ name: newName })
        .eq("id", id);
      if (error) throw error;
      fetchGalleries();
    } catch (error) {
      console.error("Error al editar galería:", error);
      setError("No se pudo editar la galería. Por favor, intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteGallery(id) {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("galleries")
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchGalleries();
      if (selectedGallery && selectedGallery.id === id) {
        setSelectedGallery(null);
        setLocalImages([]);
      }
    } catch (error) {
      console.error("Error al eliminar galería:", error);
      setError("No se pudo eliminar la galería. Por favor, intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  async function addImage(imageUrl) {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from("galleries_images").insert([
        {
          url: imageUrl,
          title: "Nueva Imagen",
          gallery_id: selectedGallery.id,
        },
      ]);
      if (error) throw error;
      fetchImages(selectedGallery.id);
    } catch (error) {
      console.error("Error al añadir imagen:", error);
      setError("No se pudo añadir la imagen. Por favor, intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  async function removeImage(imageId) {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("galleries_images")
        .delete()
        .eq("id", imageId)
        .eq("gallery_id", selectedGallery.id);
      if (error) throw error;
      fetchImages(selectedGallery.id);
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      setError("No se pudo eliminar la imagen. Por favor, intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectGallery = (gallery) => {
    setSelectedGallery(gallery);
    setIsGalleryDialogOpen(true);
  };

  const [localImages, setLocalImages] = useState([]);

  function handleOnUpload(error, result, widget) {
    if (error) {
      setError(error);
      widget.close({
        quiet: true,
      });
      return;
    }
    const re = result?.info?.secure_url;
    if (re.trim()) {
      addImage(re.trim());
    }
  }

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="flex flex-wrap justify-start gap-4 p-4">
        <GalleryList
          galleries={galleries}
          onSelectGallery={handleSelectGallery}
          onAddGallery={addGallery}
          onEditGallery={editGallery}
          onDeleteGallery={deleteGallery}
          isLoading={isLoading}
        />
      </div>
      {isGalleryDialogOpen && selectedGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-4xl p-6 rounded-lg shadow-lg flex flex-col max-h-[80vh]">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{selectedGallery.name}</h2>
            </div>
            <div className="flex-grow overflow-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : localImages.length === 0 ? (
                <p className="text-gray-500 mt-4 text-center">
                  No hay imágenes en esta galería.
                </p>
              ) : (
                <ImageList images={localImages} onRemoveImage={removeImage} />
              )}
            </div>
            <div className="mt-4 flex items-center gap-2">
              {/* <Input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="URL de la nueva imagen"
                className="flex-grow"
              /> */}
              <UploadWidget onUpload={handleOnUpload}>
                {({ open }) => {
                  function handleOnClick(e) {
                    e.preventDefault();
                    open();
                  }
                  return (
                    <Button onClick={handleOnClick} disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Añadir"
                      )}
                    </Button>
                  );
                }}
              </UploadWidget>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setIsGalleryDialogOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
