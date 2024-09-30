'use client'

import { useState, useEffect } from 'react'
import { Table } from "@/components/ui/table"
import { Button } from "@/components/ui/button"


interface Slide {
  id: number
  name: string
  images: string[]
  created_at: string
}

const mockSlideService = {
  getSlides: (): Promise<Slide[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: "Summer Collection", images: ["/img1.jpg", "/img2.jpg"], created_at: "2023-06-15T10:30:00Z" },
          { id: 2, name: "Winter Sale", images: ["/img3.jpg", "/img4.jpg"], created_at: "2023-06-16T14:45:00Z" },
        ])
      }, 1000)
    })
  }
}

export default function SlideList() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { Tr, Th, Td, THead, TBody } = Table
  useEffect(() => {
    const fetchSlides = async () => {
      setIsLoading(true)
      try {
        const data = await mockSlideService.getSlides()
        setSlides(data)
      } catch (error) {
        console.error('Error fetching slides:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlides()
  }, [])

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando slides...</div>
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
                <a href={`/slides/edit/${slide.id}`}>
                  <Button variant="default" size="sm">Editar</Button>
                </a>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  )
}