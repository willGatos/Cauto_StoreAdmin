import { useState, useEffect } from "react";
import { supabaseService } from "@/services/Supabase/AttributeService"; // Asegúrate de importar tu servicio de Supabase
import { Category } from "@/@types/category";
import { transformArrayToObjectArray } from "../../../ProductForm";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await supabaseService.getCategories();
        if (error) throw error;

        // Estructurar para Opciones de Select
        console.log("CAT", data);

        setCategories(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
