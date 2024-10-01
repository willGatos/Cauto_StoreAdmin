"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import UploadWidget from "@/views/inventory/Product/ProductForm/components/Images";
import supabase from "@/services/Supabase/BaseClient";
import { useAppSelector } from "@/store";
export const createSlide = async (slide: Slide): Promise<Slide> => {
    try {
      const { data, error } = await supabase.from('slides').insert(slide)
      
      if (error) throw error
      
      return data
    } catch (error) {
      console.error('Error creating slide:', error)
      throw error
    }
  }
  
  export const updateSlide = async (id: string, slide: Partial<Slide>): Promise<Slide> => {
    try {
      const { data, error } = await supabase.from('slides').update(slide).eq('id', id)
      
      if (error) throw error
      
      return data
    } catch (error) {
      console.error('Error updating slide:', error)
      throw error
    }
  }
interface Slide {
  name: string;
  shop_id: string | number;
  images: string[];
}

export default function SlideCreate() {
  const [slide, setSlide] = useState<Slide>({
    name: "",
    images: [""],
    shop_id: ''
  });
  const { shopId } = useAppSelector(
    (state) => state.auth.user
)
  const [error, updateError] = useState();
  const [localImages, setLocalImages] = useState([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const upload = slide;
      upload.images = localImages;
      upload.shop_id = shopId
      await createSlide(slide);
    } catch (error) {
      console.error("Error creating slide:", error);
    }
  };

  const handleImageUpload = async (error, result, widget) => {
    console.log("VIDEO");
    console.log(result, error);

    if (error) {
      updateError(error);
      widget.close({
        quiet: true,
      });
      return;
    }
    setLocalImages((prevImages) => [...prevImages, result]);

    // Actualizar el estado con una imagen de carga
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(localImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalImages(items);
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name">Nombre</label>
          <Input
            id="name"
            value={slide.name}
            onChange={(e) => setSlide({ ...slide, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Imágenes</label>
          <div className="flex flex-row overflow-scroll">
            {localImages.map((img) => (
              <img src={img} key={img} className="w-80 h-60" alt="" />
            ))}
          </div>
          <UploadWidget
            onUpload={(error, result, widget) => {
              const img = result?.info?.secure_url;
              handleImageUpload(error, img, widget);
            }}
          >
            {({ open }) => {
              function handleOnClick(e) {
                e.preventDefault();
                open();
              }
              return (
                <Button type="button" className="mt-2" onClick={handleOnClick}>
                  Agregar Imagen
                </Button>
              );
            }}
          </UploadWidget>
        </div>
        <Button type="submit">Crear Slide</Button>
      </form>
    </div>
  );
}
