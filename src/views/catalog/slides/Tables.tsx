"use client";

import { useState, useEffect } from "react";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import supabase from "@/services/Supabase/BaseClient";
import { useAppSelector } from "@/store";

interface Slide {
  id: number;
  name: string;
  images: string[];
  created_at: string;
}
export const getSlides = async (shopId) => {
  try {
    const { data, error } = await supabase
      .from("slides")
      .select("*")
      .eq("shop_id", shopId);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching tables:", error);
    throw error;
  }
};

export default function SlideList() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { shopId } = useAppSelector((state) => state.auth.user);
  const { Tr, Th, Td, THead, TBody } = Table;
  useEffect(() => {
    const fetchSlides = async () => {
      setIsLoading(true);
      try {
        const data = await getSlides(shopId);
        setSlides(data);
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        Cargando slides...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lista de Slides</h1>
        <a href="/slides/create">
          <Button>Crear Nuevo Slide</Button>
        </a>
      </div>
      <Table>
        <THead>
          <Tr>
            <Th>ID</Th>
            <Th>Nombre</Th>
            <Th>Sección del Catálogo</Th>
            <Th>Número de Imágenes</Th>
            <Th>Fecha de Creación</Th>
            <Th>Acciones</Th>
          </Tr>
        </THead>
        <TBody>
          {slides.map((slide) => (
            <Tr key={slide.id}>
              <Td>{slide.id}</Td>
              <Td>{slide.name}</Td>
              <Td>{slide.images.length}</Td>
              <Td>{new Date(slide.created_at).toLocaleString()}</Td>
              <Td>
                <a href={`/app/Eslides/${slide.id}`}>
                  <Button variant="default" size="sm">
                    Editar
                  </Button>
                </a>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
