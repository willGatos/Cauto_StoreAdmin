import { useEffect, useState } from 'react'
import AdaptableCard from '@/components/shared/AdaptableCard'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import { FormItem } from '@/components/ui/Form'
import Dialog from '@/components/ui/Dialog'
import Upload from '@/components/ui/Upload'
import { HiEye, HiTrash } from 'react-icons/hi'
import cloneDeep from 'lodash/cloneDeep'
import { Field, FieldProps, FieldInputProps, FormikProps } from 'formik'
import axios from 'axios'
import Spinner from '@/components/ui/Spinner'
import Progress from '@/components/ui/Progress'

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET

type FormModel = {
    images: string[]
    [key: string]: unknown
}

type ImageListProps = {
    images: string[]
    onImageDelete: (img: string) => void
}

type ProductImagesProps = {
    values: FormModel
    setFieldValue: any
}



const ImageList = (props: ImageListProps) => {
    const { images, onImageDelete } = props

    const onUpload = async (
        form: FormikProps<FormModel>,
        field: FieldInputProps<FormModel>,
        files: FileList
    ) => {
        setProgressBar(10)
        setIsLoading(true)
 
        const uploadPromises = Array.from(files).map(file => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
 
            return axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData
            );
        });
 
        try {
            const responses = await Promise.all(uploadPromises);
            const newImages = responses.map(response => response.data.public_id);
            
            setFieldValue("images", [...values.images, ...newImages]);
            setProgressBar(100);
        } catch (error) {
            console.error('Error uploading images:', error);
            // Manejar el error aquí (por ejemplo, mostrar un mensaje al usuario)
        } finally {
            setIsLoading(false);
        }
    }

    const [selectedImg, setSelectedImg] = useState<string>({} as string)
    const [viewOpen, setViewOpen] = useState(false)
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)

    const onViewOpen = (img: string) => {
        setSelectedImg(img)
        setViewOpen(true)
    }

    const onDialogClose = () => {
        setViewOpen(false)
        setTimeout(() => {
            setSelectedImg({} as string)
        }, 300)
    }

    const onDeleteConfirmation = (img: string) => {
        setSelectedImg(img)
        setDeleteConfirmationOpen(true)
    }

    const onDeleteConfirmationClose = () => {
        setSelectedImg({} as string)
        setDeleteConfirmationOpen(false)
    }

    const onDelete = () => {
        onImageDelete?.(selectedImg)
        setDeleteConfirmationOpen(false)
    }

    const rute = process.env.SERVER + "uploads/"
    return (
        <>
            {images.map((img, key) => (
                <div
                    key={key}
                    className="group relative rounded border p-2 flex"
                >
                    <img
                        className="rounded max-h-[140px] max-w-full"
                        src={rute+ img}
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
                <img
                    className="w-full"
                    src={selectedImg}
                    alt={"img"}
                />
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
    )
}

const ProductImages = (props: ProductImagesProps) => {
    const { values, setFieldValue } = props
    const [isLoading, setIsLoading] = useState(false)
    const [progressBar, setProgressBar] = useState(0)

    const beforeUpload = (file: FileList | null) => {
        let valid: boolean | string = true

        const allowedFileType = ['image/jpeg', 'image/png']
        //const maxFileSize = 500000

        if (file) {
            for (const f of file) {
                if (!allowedFileType.includes(f.type)) {
                    valid = 'Por Favor, cargue un archivo .jpeg o .png!'
                }

                /* if (f.size >= maxFileSize) {
                    valid = 'Upload image cannot more then 500kb!'
                } */
            }
        }

        return valid
    }
    useEffect(() => {
        const interval = setInterval(() => {
            setProgressBar((oldProgress) => {
            if (oldProgress === 87) {
              clearInterval(interval);
              return 100;
            }
            if(oldProgress > 50){
                const newProgress = oldProgress + 1;
                return newProgress;
            }
            if(oldProgress > 50){
               const newProgress = oldProgress + 2;
               return newProgress;
            }
          });
        }, 900); // Actualiza cada segundo
    
        return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonta
     }, []);
    const onUpload = (
        form: FormikProps<FormModel>,
        field: FieldInputProps<FormModel>,
        files:any//: File[]
    ) => {
        //let imageId = '1-img-0'
        setProgressBar(10)

        console.log("FILES",files)
        const latestUpload = files.length - 1
        if (values.images.length > 0) {
            //const prevImgId = values.images[values.images.length - 1]
            //const splitImgId = prevImgId.split('-')
            //const newIdNumber = parseInt(splitImgId[splitImgId.length - 1]) + 1
            //splitImgId.pop()
            //const newIdArr = [...splitImgId, ...[newIdNumber]]
           //imageId = newIdArr.join('-')
        }
        const image = URL.createObjectURL(files[latestUpload])
        
        const imageList = [...values.images, ...[image]]
        
        console.log("first")
        setIsLoading(true)
        const formData = new FormData();
        console.log("first2")

        formData.append('file', files[0]);
        formData.append('upload_preset', 'service');
        console.log("first")
        setProgressBar(20)
        axios.post('http://localhost:3000/upload/productImage',formData)
        .then((res)=>
        {
            console.log("GOL",res)
            //setStoreData((prevState:StoreData) => ({...prevState, storeLogo:res.data.fileName}))
            setProgressBar(100)
            setFieldValue("images",  
            [...values.images, ...[res.data.fileName]])

            console.log(res.data.fileName)
            setTimeout(()=> {setIsLoading(false)}, 500)
        })
        //TODO: set isLoading
        //TODO: AxiosCall
        //
    }

    const handleImageDelete = (
        form: FormikProps<FormModel>,
        field: FieldInputProps<FormModel>,
        deletedImg: string
    ) => {
        let images = cloneDeep(values.images)
        images = images.filter((img) => img !== deletedImg)
        form.setFieldValue(field.name, images)
    }

    return (
        <AdaptableCard className="mb-4">
            <h5>Imagen del Producto</h5>
            <p className="mb-6">Añade imagen o cambiala</p>
            <FormItem>
                <Field name="images">
                    {({ field, form }: FieldProps) => {
                        if (values.images.length > 0) {
                            return (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    <ImageList
                                        images={values.images}
                                        onImageDelete={(img: string) => handleImageDelete(form, field, img)}
                                    />
                                    <Upload
                                        draggable
                                        className="min-h-fit"
                                        beforeUpload={beforeUpload}
                                        showList={false}
                                        onChange={(files) =>
                                            onUpload(form, field, files)
                                        }
                                    >
                                        <div className="max-w-full flex flex-col px-4 py-2 justify-center items-center">
                                            <DoubleSidedImage
                                                src="/img/others/upload.png"
                                                darkModeSrc="/img/others/upload-dark.png"
                                            />
                                            <p className="font-semibold text-center text-gray-800 dark:text-white">
                                                Cargar Imagen
                                            </p>
                                        </div>
                                    </Upload>
                                </div>
                            )
                        }

                        return (
                            <Upload
                                draggable
                                beforeUpload={beforeUpload}
                                showList={false}
                                onChange={(files) =>
                                    onUpload(form, field, files)
                                }
                            >
                                <div className="my-16 text-center">
                                    <DoubleSidedImage
                                        className="mx-auto"
                                        src="/img/others/upload.png"
                                        darkModeSrc="/img/others/upload-dark.png"
                                    />
                                    <p className="font-semibold">
                                        <span className="text-gray-800 dark:text-white">
                                            Deja caer la imagen acá, o{' '}
                                        </span>
                                        <span className="text-blue-500">
                                            busca
                                        </span>
                                    </p>
                                    <p className="mt-1 opacity-60 dark:text-white">
                                        Aguanta: jpeg, png.
                                    </p>
                                </div>
                            </Upload>
                        )
                    }}
                </Field>
            </FormItem>
                
            {isLoading && 
            <div className="flex items-center">
                <Progress percent={progressBar} /><Spinner/>
            </div> }
        </AdaptableCard>
    )
}

export default ProductImages
