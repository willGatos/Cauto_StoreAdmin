import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import supabase from "@/services/Supabase/BaseClient";
import { useAppSelector } from "@/store";
import UploadWidget from "../../Product/ProductForm/components/Images";
import { Avatar } from "@/components/ui";
import { HiOutlineUser } from "react-icons/hi";

/*

                      
*/

interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  cover: string;
  parent_id: number | null;
  subcategories?: Category[];
}

const mockCategoryService = {
  getCategories: async (shopId): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("shop_id", shopId)
      .order("id");

    if (error) throw error;

    // Función recursiva para construir la jerarquía de categorías
    const buildCategoryTree = (
      categories: Category[],
      parentId: number | null
    ): Category[] => {
      return categories
        .filter((category) => category.parent_id === parentId)
        .map((category) => ({
          ...category,
          subcategories: buildCategoryTree(categories, category.id),
        }));
    };

    // Construir el árbol de categorías comenzando desde las categorías principales (sin parent_id)
    const categoriesTree = buildCategoryTree(data, null);

    console.log(categoriesTree);
    return categoriesTree || [];
  },
  createCategory: async (
    name: string,
    description: string,
    parent_id: number | null,
    shopId,
    localImage: string
  ): Promise<Category> => {
    const { data, error } = await supabase
      .from("categories")
      .upsert({
        name,
        description,
        parent_id,
        shop_id: shopId,
        cover: localImage,
      })
      .select("*")
      .single();
    if (error) throw error;

    return data;
  },
  updateCategory: async (
    id: number,
    name: string,
    description: string,
    localImage
  ): Promise<Category> => {
    const { data, error } = await supabase
      .from("categories")
      .update({ name, description, cover: localImage })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
  deleteCategory: async (id: number): Promise<void> => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  },
};

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateSubModalOpen, setIsCreateSubModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [localImage, setLocalImage] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState<number | null>(
    null
  );
  const [expandedCategories, setExpandedCategories] = useState<
    Record<number, boolean>
  >({});
  const { shopId } = useAppSelector((state) => state.auth.user);
  useEffect(() => {
    loadCategories();
  }, []);

  const handleImageUpload = async (error, result, widget) => {
    if (error) {
      widget.close({
        quiet: true,
      });
      return;
    }
    setLocalImage(result);
  };

  const loadCategories = async () => {
    const data = await mockCategoryService.getCategories(shopId);
    setCategories(data);
  };

  const handleCreateCategory = async () => {
    if (newCategoryName.trim()) {
      const newCategory = await mockCategoryService.createCategory(
        newCategoryName,
        newCategoryDescription,
        newCategoryParentId,
        shopId,
        localImage
      );

      if (newCategoryParentId) {
        setCategories(
          categories.map((cat) =>
            addSubcategoryRecursive(cat, newCategoryParentId, newCategory)
          )
        );
      } else {
        setCategories([...categories, newCategory]);
      }
      setNewCategoryName("");
      setNewCategoryDescription("");
      setLocalImage("");
      setNewCategoryParentId(null);
      setIsCreateModalOpen(false);
      setIsCreateSubModalOpen(false);
    }
  };

  const onDialogClose = (setStateModel) => {
    setStateModel(false);
  };

  const addSubcategoryRecursive = (
    category: Category,
    parentId: number,
    newSubcategory: Category
  ): Category => {
    if (category.id === parentId) {
      return {
        ...category,
        subcategories: [...(category.subcategories || []), newSubcategory],
      };
    }
    if (category.subcategories) {
      return {
        ...category,
        subcategories: category.subcategories.map((subcat) =>
          addSubcategoryRecursive(subcat, parentId, newSubcategory)
        ),
      };
    }
    return category;
  };

  const handleUpdateCategory = async () => {
    if (currentCategory && newCategoryName.trim()) {
      const updatedCategory = await mockCategoryService.updateCategory(
        currentCategory.id,
        newCategoryName,
        newCategoryDescription,
        localImage
      );
      setCategories(updateCategoryInTree(categories, updatedCategory));
      setNewCategoryName("");
      setLocalImage("");
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
            className="py-1 px-2 border-b"
            style={{ paddingLeft: `${0.5 + depth * 1}rem` }}
          >
            {category.subcategories && category.subcategories.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => toggleCategory(category.id)}
                className="flex items-center justify-center w-10 p-0 h-5 "
                aria-label={
                  expandedCategories[category.id]
                    ? "Contraer categoría"
                    : "Expandir categoría"
                }
              >
                {expandedCategories[category.id] ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            )}
          </td>
          <td className="py-1 px-2 border-b">{category.id}</td>
          <td className="py-1 px-2 border-b">{category.name}</td>
          {/* <td className="py-1 px-2 border-b">{category.description}</td> */}
          <td className="py-1 px-2 border-b">
            <div className="flex space-x-1">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setCurrentCategory(category);
                  setNewCategoryName(category.name);
                  setNewCategoryDescription(category.description);
                  setIsEditModalOpen(true);
                  setLocalImage(category.cover);
                }}
                className="p-1 h-6flex items-center justify-center w-10"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleDeleteCategory(category.id)}
                className="p-1 h-6 flex items-center justify-center w-10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setNewCategoryParentId(category.id);
                  setNewCategoryName("");
                  setNewCategoryDescription("");
                  setIsCreateSubModalOpen(true);
                }}
                className="p-1 h-6 flex items-center justify-center w-10"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
              <Dialog
                onClose={() => onDialogClose(setIsCreateSubModalOpen)}
                isOpen={isCreateSubModalOpen}
              >
                <div className="sm:max-w-[425px]">
                  <div>
                    <h2>Agregar Subcategoría</h2>
                  </div>
                  <div className="grid gap-4 py-4">
                    <Input
                      id="name"
                      placeholder="Nombre de la subcategoría"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    {/* <Input
                      textArea
                      id="description"
                      placeholder="Descripción de la subcategoría"
                      value={newCategoryDescription}
                      onChange={(e) =>
                        setNewCategoryDescription(e.target.value)
                      }
                    /> */}
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
                          <div onClick={handleOnClick}>
                            <Avatar
                              className="border-2 border-white dark:border-gray-800 shadow-lg"
                              size={60}
                              shape="circle"
                              src={localImage}
                              icon={<HiOutlineUser />}
                            />
                          </div>
                        );
                      }}
                    </UploadWidget>
                  </div>
                  <Button onClick={handleCreateCategory}>
                    Crear Subcategoría
                  </Button>
                </div>
              </Dialog>
            </div>
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
    <div className="container mx-auto p-2">
      <h1 className="text-xl font-bold mb-2">Gestor de Categorías</h1>
      <Button
        variant="solid"
        className="mb-2 flex justify-center items-center"
        onClick={() => {
          setNewCategoryParentId(null);
          setIsCreateModalOpen(true);
        }}
      >
        <PlusCircle className="mr-1 h-4 w-4" />
        Crear Categoría
      </Button>
      <Dialog
        onClose={() => onDialogClose(setIsCreateModalOpen)}
        isOpen={isCreateModalOpen}
      >
        <div className="sm:max-w-[425px]">
          <div>
            <h1>Crear Nueva Categoría</h1>
          </div>
          <div className="grid gap-4 py-4">
            <Input
              id="name"
              placeholder="Nombre de la categoría"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            {/* <Input
              textArea
              id="description"
              placeholder="Descripción de la categoría"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
            /> */}
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
                  <div onClick={handleOnClick}>
                    <Avatar
                      className="border-2 border-white dark:border-gray-800 shadow-lg"
                      size={60}
                      shape="circle"
                      src={localImage}
                      icon={<HiOutlineUser />}
                    />
                  </div>
                );
              }}
            </UploadWidget>
          </div>
          <Button onClick={handleCreateCategory}>Crear</Button>
        </div>
      </Dialog>

      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-1 px-2 border-b text-left"></th>
              <th className="py-1 px-2 border-b text-left">ID</th>
              <th className="py-1 px-2 border-b text-left">Nombre</th>
              {/* <th className="py-1 px-2 border-b text-left">Descripción</th> */}
              <th className="py-1 px-2 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>{renderCategories(categories)}</tbody>
        </table>
      </div>

      <Dialog
        onClose={() => onDialogClose(setIsEditModalOpen)}
        isOpen={isEditModalOpen}
      >
        <div className="sm:max-w-[425px]">
          <div>
            <h1>Editar Categoría</h1>
          </div>
          <div className="grid gap-4 py-4">
            <Input
              id="edit-name"
              placeholder="Nombre de la categoría"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            {/* <Input
              textArea
              id="edit-description"
              placeholder="Descripción de la categoría"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
            /> */}
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
                  <div onClick={handleOnClick}>
                    <Avatar
                      className="border-2 border-white dark:border-gray-800 shadow-lg"
                      size={60}
                      shape="circle"
                      src={localImage}
                      icon={<HiOutlineUser />}
                    />
                  </div>
                );
              }}
            </UploadWidget>
          </div>
          <Button onClick={handleUpdateCategory}>Actualizar</Button>
        </div>
      </Dialog>
    </div>
  );
}
