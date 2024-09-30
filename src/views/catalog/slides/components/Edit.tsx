'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useParams } from 'react-router-dom'

interface Slide {
  id: number
  name: string
  images: string[]
}

const mockSlideService = {
  getSlide: (id: number): Promise<Slide> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: id,
          name: "Summer Collection",
          images: ["/img1.jpg", "/img2.jpg"],
        })
      }, 1000)
    })
  },
  updateSlide: (slide: Slide): Promise<Slide> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(slide)
      }, 1000)
    })
  }
}

export default function SlideEdit() {
  const { id } = useParams()
  const [slide, setSlide] = useState<Slide | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const fetchSlide = async () => {
        setIsLoading(true)
        try {
          const data = await mockSlideService.getSlide(Number(id))
          setSlide(data)
        } catch (error) {
          console.error('Error fetching slide:', error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchSlide()
    }
  }, [id])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (slide) {
      try {
        await mockSlideService.updateSlide(slide)
      } catch (error) {
        console.error('Error updating slide:', error)
      }
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando slide...</div>
  }

  if (!slide) {
    return <div className="text-center">Slide no encontrado</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
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
              {slide.images.map((image, index) => (
                <Input
                  key={index}
                  value={image}
                  onChange={(e) => {
                    const newImages = [...slide.images]
                    newImages[index] = e.target.value
                    setSlide({ ...slide, images: newImages })
                  }}
                  className="mb-2"
                />
              ))}
            </div>
            <Button type="submit">Guardar Cambios</Button>
          </form>
      </Card>
    </div>
  )
}