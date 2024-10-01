"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import UploadWidget from "@/views/inventory/Product/ProductForm/components/Images";
import { useAppSelector } from "@/store";
import supabase from "@/services/Supabase/BaseClient";
import cloneDeep from "lodash/cloneDeep";

interface Slide {
  id?: number;
  name: string;
  shop_id: string | number;
  images: string[];
}

const getSlideById = async (id: number): Promise<Slide | null> => {
    try {
      const { data, error } = await supabase.from('slides').select('*').eq('id', id).single()
      
      if (error) throw error
      
      return data || null
    } catch (error) {
      console.error('Error fetching slide:', error)
      throw error
    }
  }
  
const updateSlide = async (slide: Slide, id): Promise<Slide> => {
    try {
      const { data, error } = await supabase.from('slides').update(slide).eq('id', id)
      
      if (error) throw error
      
      return data
    } catch (error) {
      console.error('Error updating slide:', error)
      throw error
    }
  }

export default function SlideEdit() {
  const { id } = useParams();
  const [slide, setSlide] = useState<Slide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { shopId } = useAppSelector((state) => state.auth.user);
  const [error, updateError] = useState();
  const [localImages, setLocalImages] = useState([]);
  useEffect(() => {
    console.log(id)
    if (id) {
      const fetchSlide = async () => {
        setIsLoading(true);
        try {
          const data = await getSlideById(Number(id));
          setSlide(data);
          setLocalImages(data.images);
        } catch (error) {
          console.error("Error fetching slide:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSlide();
    }
  }, [id]);

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

  const handleImageDelete = (
    form,
    field,
    deletedImg: string
  ) => {
    let images = cloneDeep(localImages);
    images = images.filter((img) => img !== deletedImg);
    setLocalImages(images);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (slide) {
      try {
        await updateSlide({name: slide.name, shop_id: shopId, images: localImages}, slide.id);
      } catch (error) {
        console.error("Error updating slide:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        Cargando slide...
      </div>
    );
  }

  if (!slide) {
    return <div className="text-center">Slide no encontrado</div>;
  }

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
        <Button type="submit">Guardar Cambios</Button>
      </form>
    </div>
  );
}
