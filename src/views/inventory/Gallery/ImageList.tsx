import React from "react";
import { Button } from "@/components/ui/Button";

export default function ImageList({ images, onRemoveImage }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {images.map((image) => (
        <div key={image.id} className="relative group">
          <img
            src={image.url}
            alt={image.title}
            className="w-full h-32 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button
              variant="default"
              size="sm"
              onClick={() => onRemoveImage(image.id)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
