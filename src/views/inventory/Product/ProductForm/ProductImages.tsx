import { useEffect, useState } from "react";
import AdaptableCard from "@/components/shared/AdaptableCard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DoubleSidedImage from "@/components/shared/DoubleSidedImage";
import { FormItem } from "@/components/ui/Form";
import Dialog from "@/components/ui/Dialog";
import Upload from "@/components/ui/Upload";
import { HiEye, HiTrash } from "react-icons/hi";
import cloneDeep from "lodash/cloneDeep";
import { Field, FieldProps, FieldInputProps, FormikProps } from "formik";
import Spinner from "@/components/ui/Spinner";
import Progress from "@/components/ui/Progress";
import UploadWidget from "./components/Images";
import supabase from "@/services/Supabase/BaseClient";

type FormModel = {
  images: string[];
  [key: string]: unknown;
};

type ImageListProps = {
  images: string[];
  onImageDelete: (img: string) => void;
};

type ProductImagesProps = {
  localImages: string[];
  setLocalImages: any;
};

const ImageList = (props: ImageListProps) => {
  const { images, onImageDelete } = props;
  const [selectedImg, setSelectedImg] = useState<string>({} as string);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const onViewOpen = (img: string) => {
    setSelectedImg(img);
    setViewOpen(true);
  };

  const onDialogClose = () => {
    setViewOpen(false);
    setTimeout(() => {
      setSelectedImg({} as string);
    }, 300);
  };

  const onDeleteConfirmation = (img: string) => {
    setSelectedImg(img);
    setDeleteConfirmationOpen(true);
  };

  const onDeleteConfirmationClose = () => {
    setSelectedImg({} as string);
    setDeleteConfirmationOpen(false);
  };

  const onDelete = () => {
    onImageDelete?.(selectedImg);
    setDeleteConfirmationOpen(false);
  };

  return (
    <>
      {images.map((img, key) => (
        <div key={key} className="group relative rounded border p-2 flex">
          <img
            className="rounded max-h-[140px] max-w-full"
            src={img}
            alt={""}
          />
          <div className="absolute inset-2 bg-gray-900/[.7] group-hover:flex hidden text-xl items-center justify-center">
            <span
              className="text-gray-100 hover:text-gray-300 cursor-pointer p-1.5"
              onClick={() => onViewOpen(img)}
            >
              <HiEye />
            </span>
            <span
              className="text-gray-100 hover:text-gray-300 cursor-pointer p-1.5"
              onClick={() => onDeleteConfirmation(img)}
            >
              <HiTrash />
            </span>
          </div>
        </div>
      ))}
      <Dialog
        isOpen={viewOpen}
        onClose={onDialogClose}
        onRequestClose={onDialogClose}
      >
        <img className="w-full" src={selectedImg} alt={"img"} />
      </Dialog>
      <ConfirmDialog
        isOpen={deleteConfirmationOpen}
        type="danger"
        title="Remove image"
        confirmButtonColor="red-600"
        onClose={onDeleteConfirmationClose}
        onRequestClose={onDeleteConfirmationClose}
        onCancel={onDeleteConfirmationClose}
        onConfirm={onDelete}
      >
        <p> Are you sure you want to remove this image? </p>
      </ConfirmDialog>
    </>
  );
};

const ProductImages = (props: ProductImagesProps) => {
  const { localImages, setLocalImages } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [progressBar, setProgressBar] = useState(0);
  const [error, updateError] = useState();

  function handleOnUpload(error, result, widget) {
    if (error) {
      updateError(error);
      widget.close({
        quiet: true,
      });
      return;
    }
    setLocalImages((prevImages) => [...prevImages, result?.info?.secure_url]);
  }

  //   const beforeUpload = (file: FileList | null) => {
  //     let valid: boolean | string = true;

  //     const allowedFileType = ["image/jpeg", "image/png"];
  //     //const maxFileSize = 500000

  //     if (file) {
  //       for (const f of file) {
  //         if (!allowedFileType.includes(f.type)) {
  //           valid = "Por Favor, cargue un archivo .jpeg o .png!";
  //         }

  //         /* if (f.size >= maxFileSize) {
  //                     valid = 'Upload image cannot more then 500kb!'
  //                 } */
  //       }
  //     }

  //     return valid;
  //   };

  useEffect(() => {
    // console.log(values);
    const interval = setInterval(() => {
      setProgressBar((oldProgress) => {
        if (oldProgress === 87) {
          clearInterval(interval);
          return 100;
        }
        if (oldProgress > 50) {
          const newProgress = oldProgress + 1;
          return newProgress;
        }
        if (oldProgress > 50) {
          const newProgress = oldProgress + 2;
          return newProgress;
        }
      });
    }, 900); // Actualiza cada segundo

    return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonta
  }, []);
  //   const onUpload = async (
  //     form: FormikProps<FormModel>,
  //     field: FieldInputProps<FormModel>,
  //     files: FileList
  //   ) => {
  //     setProgressBar(10);
  //     setIsLoading(true);

  //     // Crear un array de promesas de subida
  //     //     const uploadPromises = Array.from(files).map((file) => ()
  //     // //        uploadImageToCloudinary(file)
  //     // );

  //     try {
  //       // Esperar a que todas las imágenes sean subidas
  //       const uploadResponses = await Promise.all(uploadPromises);

  //       // Mapear los public_id de las imágenes subidas
  //       const newImages = uploadResponses.map((response) => response.public_id);

  //       // Actualizar el campo 'images' con las nuevas imágenes
  //       form.setFieldValue("images", [...form.localImages, ...newImages]);

  //       setProgressBar(100);
  //     } catch (error) {
  //       console.error("Error uploading images:", error);
  //       // Manejo de error (mostrar mensaje al usuario, etc.)
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  const handleImageDelete = (
    form: FormikProps<FormModel>,
    field: FieldInputProps<FormModel>,
    deletedImg: string
  ) => {
    let images = cloneDeep(localImages);
    images = images.filter((img) => img !== deletedImg);
    setLocalImages(images);
  };

  return (
    <AdaptableCard className="mb-4">
      <h5>Imagen del Producto</h5>
      <p className="mb-6">Añade imagen o cambiala</p>
      <FormItem>
        <Field name="images" es>
          {({ field, form }: FieldProps) => {
            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <ImageList
                  images={localImages}
                  onImageDelete={(img: string) =>
                    handleImageDelete(form, field, img)
                  }
                />
                <UploadWidget onUpload={handleOnUpload}>
                  {({ open }) => {
                    function handleOnClick(e) {
                      e.preventDefault();
                      open();
                    }
                    return (
                      <button onClick={handleOnClick}>Subir Imagen</button>
                    );
                  }}
                </UploadWidget>
              </div>
            );
          }}
        </Field>
      </FormItem>

      <Gallery setLocalImages={setLocalImages} />

      {isLoading && (
        <div className="flex items-center">
          <Progress percent={progressBar} />
          <Spinner />
        </div>
      )}
    </AdaptableCard>
  );
};

export default ProductImages;

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function Gallery({ setLocalImages }) {
  const [galleries, setGalleries] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGalleries();
  }, []);

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

  const handleSelectGallery = (gallery) => {
    setSelectedGallery(gallery);
    fetchImages(gallery.id);
  };

  const handleSelectImage = (image) => {
    setSelectedImages((prev) => {
      if (prev.find((img) => img.id === image.id)) {
        return prev.filter((img) => img.id !== image.id);
      } else {
        return [...prev, image];
      }
    });
    setLocalImages((prev) => {
      if (prev.find((img) => img.id === image.id)) {
        return prev.filter((img) => img !== image.url);
      } else {
        return [...prev, image.url];
      }
    });
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
      <Button type="button" onClick={() => setIsGalleryDialogOpen(true)}>
        Acceder a Bibliotecas Imágenes
      </Button>

      <div>
        <Dialog
          isOpen={isGalleryDialogOpen}
          onClose={() => setIsGalleryDialogOpen(false)}
        >
          <div className="max-w-4xl max-h-[80vh] flex flex-col">
            <div>
              <div>
                {selectedGallery
                  ? `Imágenes de ${selectedGallery.name}`
                  : "Seleccionar Galería"}
              </div>
            </div>
            <div className="flex-grow overflow-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : !selectedGallery ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                  {galleries.map((gallery) => (
                    <Button
                      key={gallery.id}
                      type="button"
                      variant="plain"
                      onClick={() => handleSelectGallery(gallery)}
                      className="h-24 flex flex-col items-center justify-center text-center"
                    >
                      <span className="font-semibold">{gallery.name}</span>
                      <span className="text-sm text-gray-500">Seleccionar</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className={`relative cursor-pointer border-2 ${
                          selectedImages.find((img) => img.id === image.id)
                            ? "border-blue-500"
                            : "border-transparent"
                        }`}
                        onClick={() => handleSelectImage(image)}
                      >
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-24 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selectedGallery && (
              <div className="mt-4 flex justify-between">
                <Button type="button" onClick={() => setSelectedGallery(null)}>
                  Volver a Galerías
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsGalleryDialogOpen(false)}
                >
                  Confirmar Selección
                </Button>
              </div>
            )}
          </div>
        </Dialog>
      </div>
    </div>
  );
}
