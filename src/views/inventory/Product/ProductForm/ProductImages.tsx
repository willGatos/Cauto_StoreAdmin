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
import axios from "axios";
import Spinner from "@/components/ui/Spinner";
import Progress from "@/components/ui/Progress";
import UploadWidget from "./components/Images";

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


  //   const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  //   const CLOUDINARY_UPLOAD_PRESET = import.meta.env
  //     .VITE_CLOUDINARY_UPLOAD_PRESET;

  function handleOnUpload(error, result, widget) {
    if (error) {
      updateError(error);
      widget.close({
        quiet: true,
      });
      return;
    }
    setLocalImages(prevImages => [...prevImages, result?.info?.secure_url]);

    //setFieldValue("images", [...localImages, result?.info?.secure_url]);
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
    form.setFieldValue(field.name, images);
  };

  return (
    <AdaptableCard className="mb-4">
      <h5>Imagen del Producto</h5>
      <p className="mb-6">Añade imagen o cambiala</p>
      <FormItem>
        <Field name="images" es>
          {({ field, form }: FieldProps) => {
            console.log("HOLA", localImages);
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

// return (
//   <Upload
//     draggable
//     beforeUpload={beforeUpload}
//     showList={false}
//     onChange={(files) => onUpload(form, field, files)}
//   >
//     <div className="my-16 text-center">
//       <DoubleSidedImage
//         className="mx-auto"
//         src="/img/others/upload.png"
//         darkModeSrc="/img/others/upload-dark.png"
//       />
//       <p className="font-semibold">
//         <span className="text-gray-800 dark:text-white">
//           Deja caer la imagen acá, o{" "}
//         </span>
//         <span className="text-blue-500">busca</span>
//       </p>
//       <p className="mt-1 opacity-60 dark:text-white">
//         Aguanta: jpeg, png.
//       </p>
//     </div>
//   </Upload>
// );
