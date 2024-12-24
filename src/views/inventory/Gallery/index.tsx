import React, { useState, useEffect } from "react";
import supabase from "@/services/Supabase/BaseClient";
import GalleryList from "./GalleryList";
import ImageList from "./ImageList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import axios from "axios";
import Compressor from "compressorjs";
import Progress from "@/components/ui/progress";

interface UploadProgress {
  [key: string]: {
    progress: number;
    status: "preparing" | "uploading" | "completed";
  };
}

export default function GalleryManager() {
  const [galleries, setGalleries] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    fetchGalleries();
  }, []);

  useEffect(() => {
    if (selectedGallery) {
      fetchImages(selectedGallery.id);
    }
  }, [selectedGallery]);

  useEffect(() => {
    // Calculate total progress whenever uploadProgress changes
    const progressValues = Object.values(uploadProgress);
    if (progressValues.length > 0) {
      const totalProgressSum = progressValues.reduce(
        (sum, current) => sum + current.progress,
        0
      );
      const averageProgress = totalProgressSum / progressValues.length;
      setTotalProgress(averageProgress);
    }
  }, [uploadProgress]);

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
      setImages(data);
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
        setImages([]);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedGallery) return;

    setIsLoading(true);
    setError(null);
    setUploadProgress({});

    // Initialize progress for all files
    const initialProgress: UploadProgress = {};
    Array.from(files).forEach((_, index) => {
      initialProgress[index] = { progress: 0, status: "preparing" };
    });
    setUploadProgress(initialProgress);

    const uploadPromises = Array.from(files).map(
      (file, index) =>
        new Promise<string>((resolve, reject) => {
          new Compressor(file, {
            quality: 0.6,
            success(result) {
              setUploadProgress((prev) => ({
                ...prev,
                [index]: { ...prev[index], status: "uploading" },
              }));

              const formData = new FormData();
              formData.append("file", result);
              formData.append("upload_preset", "events");

              axios
                .post(
                  "https://api.cloudinary.com/v1_1/dolzgvsos/image/upload",
                  formData,
                  {
                    onUploadProgress: (progressEvent) => {
                      const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total!
                      );
                      setUploadProgress((prev) => ({
                        ...prev,
                        [index]: {
                          progress: percentCompleted,
                          status: "uploading",
                        },
                      }));
                    },
                  }
                )
                .then((response) => {
                  setUploadProgress((prev) => ({
                    ...prev,
                    [index]: { progress: 100, status: "completed" },
                  }));
                  resolve(response.data.secure_url);
                })
                .catch((error) => {
                  console.error("Error uploading image:", error);
                  reject(error);
                });
            },
            error(err) {
              console.error("Error compressing image:", err);
              reject(err);
            },
          });
        })
    );

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      for (const url of uploadedUrls) {
        await addImage(url);
      }
    } catch (err) {
      setError("Error uploading images. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
              ) : images.length === 0 ? (
                <p className="text-gray-500 mt-4 text-center">
                  No hay imágenes en esta galería.
                </p>
              ) : (
                <ImageList images={images} onRemoveImage={removeImage} />
              )}
            </div>
            <div className="mt-4">
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isLoading}
              />
              {isLoading && Object.keys(uploadProgress).length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Total Progress</h3>
                  <Progress percent={totalProgress} className="w-full" />
                  <div className="mt-4">
                    {Object.entries(uploadProgress).map(
                      ([index, { progress, status }]) => (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between text-sm">
                            <span>Image {parseInt(index) + 1}</span>
                            <span>
                              {status === "preparing"
                                ? "Preparing..."
                                : `${progress}%`}
                            </span>
                          </div>
                          <Progress percent={progress} className="w-full" />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
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
