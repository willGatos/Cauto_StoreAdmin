import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/";
import { Table } from "@/components/ui";
import NotificationMessage from "../../crm/CrmDashboard/components/NotificationMessage";
import { useSelector } from "react-redux";
import { useAppSelector } from "@/store";
import supabase from "@/services/Supabase/BaseClient";
import { name } from "@cloudinary/url-gen/actions/namedTransformation";

export const getProductsByShopId = async (shopId: number) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", shopId)
    .order("standard_price");

  if (error) console.error("Error al obtener productos:", error);
  else console.log("Productos obtenidos:", data);

  return data;
};

const typeOfView = [
  { label: "Grilla", value: "Grid" },
  { label: "Flex", value: "Flex" },
];

export const saveCatalogSectionToApi = async (sectionData: {
  shopId: number;
  name: string;
  type_of_view: "Grid" | "Flex";
}) => {
  const { data, error } = await supabase
    .from("catalog_sections")
    .insert({
      shop_id: sectionData.shopId,
      name: sectionData.name,
      type_of_view: sectionData.type_of_view,
    })
    .select();

  if (error) console.error("Error al guardar sección:", error);
  else console.log("Sección guardada:", data[0]);

  return data[0];
};
export const updateCatalogSection = async (
  sectionId: number,
  updatedData: {
    name?: string;
    type_of_view?: "Grid" | "Flex";
    products?: { id: number }[];
  }
) => {
  try {
    // Actualizar los datos de la sección
    const { data: updatedSection } = await supabase
      .from("catalog_sections")
      .update({
        name: updatedData.name,
        type_of_view: updatedData.type_of_view,
      })
      .eq("id", sectionId)
      .select();

    if (!updatedSection || !updatedSection.length) {
      throw new Error("Sección no encontrada");
    }

    // Actualizar los productos asociados a la sección si es necesario
    if (updatedData.products) {
      await addProductsToSection(
        sectionId,
        updatedData.products.map((p) => p.id)
      );
    }

    return updatedSection[0];
  } catch (error) {
    console.error("Error al actualizar la sección:", error);
    throw error;
  }
};

export const addProductsToSection = async (
  sectionId: number,
  productIds: number[]
) => {
  try {
    console.log("HOLA", sectionId);
    // Eliminar productos existentes de la sección
    await supabase
      .from("catalog_section_products")
      .delete()
      .eq("catalog_section_id", sectionId);

    // Agregar nuevos productos a la sección
    const { data, error } = await supabase
      .from("catalog_section_products")
      .insert(
        productIds.map((productId) => ({
          catalog_section_id: sectionId,
          product_id: productId,
        }))
      );

    if (error) throw error;

    console.log("Productos agregados a la sección:", data);
    return data;
  } catch (error) {
    console.error("Error al agregar productos a la sección:", error);
    throw error;
  }
};

const fetchSections = async (shopId: number) => {
  try {
    const { data: sectionsData, error: sectionsError } = await supabase.from(
      "catalog_sections"
    ).select(`
        *,
        products: catalog_section_products (
          product_id (
            *
          )
        )
      `);

    if (sectionsError) throw sectionsError;

    console.log(sectionsData);

    return sectionsData.map((section) => ({
      ...section,
      products: section.products.map((product) => product.product_id),
    }));
  } catch (error) {
    console.error("Error al obtener secciones y productos:", error);
    throw error;
  }
};

const { Tr, Th, Td, THead, TBody } = Table;
type Product = {
  id: number;
  name: string;
  standard_price: number;
  images: string;
};

type CatalogSection = {
  id?: number;
  name: string;
  type_of_view: "Grid" | "Flex";
  products: Product[];
};

export default function Component() {
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const [currentSection, setCurrentSection] = useState<CatalogSection | null>(
    null
  );
  const [sectionName, setSectionName] = useState("");
  const [viewType, setViewType] = useState();
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [products, setProducts] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  // Función para iniciar la edición de una sección
  const handleEditSection = (section) => {
    setCurrentSection(section);
    setSectionName(section.name);
    setViewType(typeOfView.find(({ value }) => value == section.type_of_view));
    setSelectedProducts(section.products.map((product) => product.id));
    setIsEditing(true);
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setCurrentSection(null);
    setSectionName("");
    setSelectedProducts([]);
    setIsEditing(false);
  };

  const { shopId } = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    fetchSections(shopId).then(setSections);
    getProductsByShopId(shopId).then(setProducts);
  }, []);

  const handleAddProduct = (productId: number) => {
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter((id) => id !== productId));
  };

  const handleSaveSection = async () => {
    if (!sectionName.trim()) {
      alert("Por favor, ingresa un nombre para la sección.");
      return;
    }

    if (selectedProducts.length === 0) {
      alert("Por favor, selecciona al menos un producto.");
      return;
    }

    const sectionToSave = {
      id: null,
      name: sectionName.trim(),
      type_of_view: viewType.value,
      products: selectedProducts.map((id) => ({ id })),
    };

    try {
      const newSection = isEditing
        ? await updateCatalogSection(currentSection.id, {
            name: sectionName,
            type_of_view: viewType.value,
            products: selectedProducts.map((id) => ({ id })),
          })
        : await saveCatalogSectionToApi({
            shopId,
            name: sectionName.trim(),
            type_of_view: viewType.value,
            products: selectedProducts.map((id) => ({ id })),
          });
      //setCurrentSection(savedSection);
      setSectionName("");
      setSelectedProducts([]);

      sectionToSave.id = newSection.id;

      // Agregar productos seleccionados a la sección
      const addedProducts = await addProductsToSection(
        newSection.id,
        selectedProducts
      );
      // Actualizar la lista de secciones en el estado
      setSections((prevSections) =>
        prevSections.map((section) =>
          section.id === newSection.id
            ? { ...newSection, products: selectedProducts }
            : section
        )
      );
    } catch (error) {
      console.error("No se pudo guardar la sección:", error);
      alert("Error al guardar la sección.");
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Gestionar Secciones del Catálogo</h2>
        <div className="flex flex-wrap gap-5">
          <Input
            placeholder="Nombre de la sección"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            className="max-w-md"
          />

          <Select
            placeholder="Tipo de vista"
            value={viewType}
            onChange={(value) => {
              setViewType(value);
            }}
            options={typeOfView}
          />
        </div>
        <NotificationMessage
          buttonText={isEditing ? "Actualizar Sección" : "Guardar Sección"}
          notifcationText="Exito en la Creacion de la Seccion"
          action={() => {
            handleSaveSection();
          }}
        />
        {isEditing && (
          <Button variant="secondary" onClick={handleCancelEdit}>
            Cancelar Edición
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Seleccionar Productos</h3>
        <Table>
          <THead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Precio</Th>
              <Th>Acción</Th>
            </Tr>
          </THead>
          <TBody>
            {products.map((product) => (
              <Tr key={product.id}>
                <Td>{product.name}</Td>
                <Td>${product.standard_price}</Td>
                <Td>
                  {selectedProducts.includes(product.id) ? (
                    <Button
                      variant="default"
                      onClick={() => handleRemoveProduct(product.id)}
                    >
                      Quitar
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={() => handleAddProduct(product.id)}
                    >
                      Añadir
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>

      {currentSection && (
        <div className="space-y-4">
          <h5 className=" font-semibold">Previsualización:</h5>
          <h3>{currentSection.name}</h3>
          <div
            className={`
            ${
              currentSection.type_of_view === "Grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center"
                : "flex overflow-x-auto pb-4 space-x-8"
            }
          `}
          >
            {currentSection.products.map((product) => (
              <div
                key={product.id}
                className={`
                border p-6 rounded-lg shadow-md
                ${
                  currentSection.type_of_view === "Grid"
                    ? "w-full"
                    : "w-64 flex-shrink-0"
                }
              `}
              >
                <img
                  src={product.images}
                  alt={product.name}
                  className="w-full h-48 object-cover mb-4 rounded"
                />
                <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                <p className="text-xl font-bold">${product.standard_price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Secciones Existentes</h3>
        <Table>
          <THead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Tipo de Vista</Th>
              <Th>Productos</Th>
              <Th>Acción</Th>
            </Tr>
          </THead>
          <TBody>
            {sections.map((section) => (
              <Tr key={section.id}>
                <Td>{section.name}</Td>
                <Td>{section.type_of_view}</Td>
                <Td>{section.products.length}</Td>
                <Td>
                  <Button onClick={() => handleEditSection(section)}>
                    Editar
                  </Button>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
