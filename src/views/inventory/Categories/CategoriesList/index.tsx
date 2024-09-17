import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import supabase from "@/services/Supabase/BaseClient";

interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  parent_id: number | null;
  subcategories?: Category[];
}

const mockCategoryService = {
  // getCategories: (): Promise<Category[]> => {
  //   return Promise.resolve([
  //     {
  //       id: 1,
  //       name: "Electrónicos",
  //       description: "Dispositivos electrónicos y accesorios",
  //       created_at: "2023-01-01T00:00:00Z",
  //       parent_id: null,
  //       subcategories: [
  //         {
  //           id: 2,
  //           name: "Smartphones",
  //           description: "Teléfonos móviles y accesorios",
  //           created_at: "2023-01-02T00:00:00Z",
  //           parent_id: 1
  //         },
  //         {
  //           id: 3,
  //           name: "Laptops",
  //           description: "Computadoras portátiles",
  //           created_at: "2023-01-03T00:00:00Z",
  //           parent_id: 1
  //         }
  //       ]
  //     },
  //     {
  //       id: 4,
  //       name: "Ropa",
  //       description: "Prendas de vestir y artículos de moda",
  //       created_at: "2023-01-04T00:00:00Z",
  //       parent_id: null,
  //       subcategories: [
  //         {
  //           id: 5,
  //           name: "Ropa para hombre",
  //           description: "Prendas para caballeros",
  //           created_at: "2023-01-05T00:00:00Z",
  //           parent_id: 4
  //         },
  //         {
  //           id: 6,
  //           name: "Ropa para mujer",
  //           description: "Prendas para damas",
  //           created_at: "2023-01-06T00:00:00Z",
  //           parent_id: 4
  //         }
  //       ]
  //     }
  //   ])
  // },
  // createCategory: (name: string, description: string, parent_id: number | null): Promise<Category> => {
  //   return Promise.resolve({
  //     id: Date.now(),
  //     name,
  //     description,
  //     created_at: new Date().toISOString(),
  //     parent_id,
  //     subcategories: []
  //   })
  // },
  // updateCategory: (id: number, name: string, description: string): Promise<Category> => {
  //   return Promise.resolve({
  //     id,
  //     name,
  //     description,
  //     created_at: new Date().toISOString(),
  //     parent_id: null,
  //     subcategories: []
  //   })
  // },
  // deleteCategory: (id: number): Promise<void> => {
  //   return Promise.resolve()
  // }

  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("id");
    if (error) throw error;

    const categoriesFixed = data.map((category) => ({
      ...category,
      subcategories: data.filter(
        (subcategory) => subcategory.parent_id === category.id
      ),
    }));
    console.log(categoriesFixed);
    return categoriesFixed || [];
  },
  createCategory: async (
    name: string,
    description: string,
    parent_id: number | null
  ): Promise<Category> => {
    const { data, error } = await supabase
      .from("categories")
      .upsert({ name, description, parent_id })
      .select("*")
      .single();
    if (error) throw error;

    return data;
  },
  updateCategory: async (
    id: number,
    name: string,
    description: string
  ): Promise<Category> => {
    const { data, error } = await supabase
      .from("categories")
      .update({ name, description })
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },
  deleteCategory: async (id: number): Promise<void> => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  },
};

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState<number | null>(
    null
  );
  const [expandedCategories, setExpandedCategories] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await mockCategoryService.getCategories();
    setCategories(data);
  };

  const handleCreateCategory = async () => {
    if (newCategoryName.trim()) {
      const newCategory = await mockCategoryService.createCategory(
        newCategoryName,
        newCategoryDescription,
        newCategoryParentId
      );
      console.log(newCategory);

      newCategory.subcategories = [];
      if (newCategoryParentId) {
        setCategories(
          categories.map((cat) => {
            return cat.id === newCategoryParentId
              ? {
                  ...cat,
                  subcategories: [...(cat.subcategories || []), newCategory],
                }
              : cat;
          })
        );
      } else {
        newCategory.subcategories = [];
        console.log(newCategory);
        setCategories([...categories, newCategory]);
      }
      setNewCategoryName("");
      setNewCategoryDescription("");
      setNewCategoryParentId(null);
      setIsCreateModalOpen(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (currentCategory && newCategoryName.trim()) {
      const updatedCategory = await mockCategoryService.updateCategory(
        currentCategory.id,
        newCategoryName,
        newCategoryDescription
      );
      setCategories(updateCategoryInTree(categories, updatedCategory));
      setNewCategoryName("");
      setNewCategoryDescription("");
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    await mockCategoryService.deleteCategory(id);
    setCategories(deleteCategoryFromTree(categories, id));
  };

  const updateCategoryInTree = (
    cats: Category[],
    updatedCat: Category
  ): Category[] => {
    return cats.map((cat) => {
      if (cat.id === updatedCat.id) {
        return {
          ...cat,
          name: updatedCat.name,
          description: updatedCat.description,
        };
      }
      if (cat.subcategories) {
        return {
          ...cat,
          subcategories: updateCategoryInTree(cat.subcategories, updatedCat),
        };
      }
      return cat;
    });
  };

  const deleteCategoryFromTree = (cats: Category[], id: number): Category[] => {
    return cats
      .filter((cat) => cat.id !== id)
      .map((cat) => {
        if (cat.subcategories) {
          return {
            ...cat,
            subcategories: deleteCategoryFromTree(cat.subcategories, id),
          };
        }
        return cat;
      });
  };

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCategories = (categories: Category[], depth = 0) => {
    return categories.map((category) => (
      <React.Fragment key={category.id}>
        <tr className={`hover:bg-gray-50 ${depth > 0 ? "bg-gray-100" : ""}`}>
          <td
            className="py-2 px-4 border-b"
            style={{ paddingLeft: `${1 + depth * 2}rem` }}
          >
            {category.subcategories && category.subcategories.length > 0 && (
              <button
                onClick={() => toggleCategory(category.id)}
                className="focus:outline-none"
                aria-label={
                  expandedCategories[category.id]
                    ? "Contraer categoría"
                    : "Expandir categoría"
                }
              >
                {expandedCategories[category.id] ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>
            )}
          </td>
          <td className="py-2 px-4 border-b">{category.id}</td>
          <td className="py-2 px-4 border-b">{category.name}</td>
          <td className="py-2 px-4 border-b">{category.description}</td>
          <td className="py-2 px-4 border-b">
            <button
              onClick={() => {
                setCurrentCategory(category);
                setNewCategoryName(category.name);
                setNewCategoryDescription(category.description);
                setIsEditModalOpen(true);
              }}
              className="text-blue-500 hover:text-blue-700 mr-2"
            >
              <Pencil className="inline-block" />
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="inline-block" />
            </button>
          </td>
        </tr>
        {expandedCategories[category.id] &&
          category.subcategories &&
          category.subcategories.length > 0 &&
          renderCategories(category.subcategories, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestor de Categorías</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={() => {
          setNewCategoryParentId(null);
          setIsCreateModalOpen(true);
        }}
      >
        <PlusCircle className="inline-block mr-2" />
        Crear Categoría
      </button>

      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left"></th>
            <th className="py-2 px-4 border-b text-left">ID</th>
            <th className="py-2 px-4 border-b text-left">Nombre</th>
            <th className="py-2 px-4 border-b text-left">Descripción</th>
            <th className="py-2 px-4 border-b text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>{renderCategories(categories)}</tbody>
      </table>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Crear Nueva Categoría
              </h3>
              <div className="mt-2 px-7 py-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 mb-3"
                  placeholder="Nombre de la categoría"
                />
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 mb-3"
                  placeholder="Descripción de la categoría"
                  rows={3}
                />
                {/* <select
                  value={newCategoryParentId || ''}
                  onChange={(e) => setNewCategoryParentId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Categoría principal</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select> */}
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Crear
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Editar Categoría
              </h3>
              <div className="mt-2 px-7 py-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 mb-3"
                  placeholder="Nombre de la categoría"
                />
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 mb-3"
                  placeholder="Descripción de la categoría"
                  rows={3}
                />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleUpdateCategory}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
