import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/";
import { Table } from "@/components/ui";
import NotificationMessage from "../crm/CrmDashboard/components/NotificationMessage";

const { Tr, Th, Td, THead, TBody } = Table;
type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

type CatalogSection = {
  id: number;
  name: string;
  type_of_view: "Grid" | "Flex";
  products: Product[];
};

// Datos de prueba
const testProducts: Product[] = [
  {
    id: 1,
    name: "Producto 1",
    price: 19.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    name: "Producto 2",
    price: 29.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    name: "Producto 3",
    price: 39.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 4,
    name: "Producto 4",
    price: 49.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 5,
    name: "Producto 5",
    price: 59.99,
    image: "/placeholder.svg?height=200&width=200",
  },
];

export default function Component() {
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const [currentSection, setCurrentSection] = useState<CatalogSection | null>(
    null
  );
  const [sectionName, setSectionName] = useState("");
  const [viewType, setViewType] = useState();
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  // Simula la obtención de secciones
  const fetchSections = async () => {
    // En un caso real, esto sería una llamada a la API
    return [];
  };

  // Simula la creación/actualización de una sección
  const saveCatalogSection = async (section: Omit<CatalogSection, "id">) => {
    // En un caso real, esto sería una llamada POST/PUT a la API
    const newSection = { ...section, id: Date.now() };
    setSections([...sections, newSection]);
    return newSection;
  };

  useEffect(() => {
    fetchSections().then(setSections);
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
      toast({
        title: "Error",
        description: "Por favor, ingrese un nombre para la sección.",
      });
      return;
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, seleccione al menos un producto.",
      });
      return;
    }

    const sectionToSave = {
      name: sectionName.trim(),
      type_of_view: viewType.value,
      products: testProducts.filter((p) => selectedProducts.includes(p.id)),
    };

    try {
      const savedSection = await saveCatalogSection(sectionToSave);
      setCurrentSection(savedSection);
      setSectionName("");
      setSelectedProducts([]);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la sección." });
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
            options={[
              { label: "Grilla", value: "Grid" },
              { label: "Flex", value: "Flex" },
            ]}
          />
        </div>
        <NotificationMessage
          buttonText={"Guardar Sección"}
          notifcationText="Exito en la Creacion de la Seccion"
          action={() => {
            handleSaveSection();
          }}
        />
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
            {testProducts.map((product) => (
              <Tr key={product.id}>
                <Td>{product.name}</Td>
                <Td>${product.price.toFixed(2)}</Td>
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
          <h5 className=" font-semibold">
            Previsualización: 
          </h5>
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
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover mb-4 rounded"
                />
                <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                <p className="text-xl font-bold">${product.price.toFixed(2)}</p>
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
                  <Button
                    variant="default"
                    onClick={() => setCurrentSection(section)}
                  >
                    Ver
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
