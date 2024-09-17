import React, { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, X } from "lucide-react";
import supabase from "@/services/Supabase/BaseClient";
import { useSelector } from "react-redux";

// Tipos
interface Attribute {
  id: number;
  name: string;
  created_at: string;
  values: AttributeValue[];
}

interface AttributeValue {
  id: number;
  value: string;
  created_at: string;
}

// Mock service
const mockAttributeService = {
  getAttributes: async (): Promise<Attribute[]> => {
    const { data, error } = await supabase.from("attributes").select(`
        id,
        name,
        created_at,
        values:attribute_values (id, value, created_at)
      `);
    if (error) throw error;
    return data || [];
  },
  createAttribute: async (name: string, shopId: number): Promise<Attribute> => {
    const { data, error } = await supabase
      .from("attributes")
      .upsert({ name, shop_id: shopId })
      .select("*")
      .single();
    if (error) throw error;
    return { ...data, values: [] };
  },
  updateAttribute: async (id: number, name: string): Promise<Attribute> => {
    const { data, error } = await supabase
      .from("attributes")
      .update({ name })
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    console.log(data);
    return data;
  },
  deleteAttribute: async (id: number): Promise<void> => {
    const { error } = await supabase.from("attributes").delete().eq("id", id);
    if (error) throw error;
  },
  createAttributeValue: async (
    attributeId: number,
    value: string
  ): Promise<AttributeValue> => {
    const { data, error } = await supabase
      .from("attribute_values")
      .upsert({ type: attributeId, value })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
  deleteAttributeValue: async (
    attributeId: number,
    valueId: number
  ): Promise<void> => {
    const { error } = await supabase
      .from("attribute_values")
      .delete()
      .eq("id", valueId)
      .eq("type", attributeId);
    if (error) throw error;
  },
};

// Componente principal
export default function AttributesManager() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAttribute, setCurrentAttribute] = useState<Attribute | null>(
    null
  );
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    const data = await mockAttributeService.getAttributes();
    setAttributes(data);
  };

  const handleCreateAttribute = async () => {
    if (newAttributeName.trim()) {
      try {
        const newAttribute = await mockAttributeService.createAttribute(
          newAttributeName,
          user.shopId
        );
        setAttributes([...attributes, newAttribute]);
        setNewAttributeName("");
        setIsCreateModalOpen(false);
      } catch (error) {
        setErrorMessage("Error creando el atributo. Intenta de nuevo.");
      }
    }
  };

  const handleUpdateAttribute = async () => {
    if (currentAttribute && newAttributeName.trim()) {
      try {
        const updatedAttribute = await mockAttributeService.updateAttribute(
          currentAttribute.id,
          newAttributeName
        );
        setAttributes(
          attributes.map((attr) =>
            attr.id === updatedAttribute.id ? updatedAttribute : attr
          )
        );
        setNewAttributeName("");
        setIsEditModalOpen(false);
      } catch (error) {
        setErrorMessage("Error actualizando el atributo. Intenta de nuevo.");
      }
    }
  };

  const handleDeleteAttribute = async (id: number) => {
    try {
      attributes
        .find((attr) => attr.id === id)
        ?.values.map(async (value) => {
          await mockAttributeService.deleteAttributeValue(id, value.id);
        });

      await mockAttributeService.deleteAttribute(id);
      setAttributes(attributes.filter((attr) => attr.id !== id));
    } catch (error) {
      setErrorMessage("Error eliminando el atributo. Intenta de nuevo.");
    }
  };

  const handleCreateAttributeValue = async (attributeId: number) => {
    if (newAttributeValue.trim()) {
      try {
        const newValue = await mockAttributeService.createAttributeValue(
          attributeId,
          newAttributeValue
        );
        setAttributes(
          attributes.map((attr) =>
            attr.id === attributeId
              ? { ...attr, values: [...attr.values, newValue] }
              : attr
          )
        );
        setNewAttributeValue("");
      } catch (error) {
        setErrorMessage(
          "Error creando el valor del atributo. Intenta de nuevo."
        );
      }
    }
  };

  const handleDeleteAttributeValue = async (
    attributeId: number,
    valueId: number
  ) => {
    try {
      await mockAttributeService.deleteAttributeValue(attributeId, valueId);
      setAttributes(
        attributes.map((attr) =>
          attr.id === attributeId
            ? { ...attr, values: attr.values.filter((v) => v.id !== valueId) }
            : attr
        )
      );
    } catch (error) {
      setErrorMessage(
        "Error eliminando el valor del atributo. Intenta de nuevo."
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestor de Atributos</h1>
      {/* Mostrar mensaje de error si existe */}
      {errorMessage && <div className="mb-4 text-red-600">{errorMessage}</div>}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <PlusCircle className="inline-block mr-2" />
        Crear Atributo
      </button>

      {/* Tabla de Atributos */}
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">ID</th>
            <th className="py-2 px-4 border-b text-left">Nombre</th>
            <th className="py-2 px-4 border-b text-left">Valores</th>
            <th className="py-2 px-4 border-b text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {attributes.map((attribute) => (
            <tr key={attribute.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{attribute.id}</td>
              <td className="py-2 px-4 border-b">{attribute.name}</td>
              <td className="py-2 px-4 border-b">
                {attribute.values.map((value) => (
                  <span
                    key={value.id}
                    className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                  >
                    {value.value}
                    <button
                      onClick={() =>
                        handleDeleteAttributeValue(attribute.id, value.id)
                      }
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="inline-block w-4 h-4" />
                    </button>
                  </span>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateAttributeValue(attribute.id);
                  }}
                  className="inline-block"
                >
                  <input
                    type="text"
                    value={newAttributeValue}
                    onChange={(e) => setNewAttributeValue(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    placeholder="Nuevo valor"
                  />
                  <button
                    type="submit"
                    className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
                  >
                    Agregar
                  </button>
                </form>
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => {
                    setCurrentAttribute(attribute);
                    setNewAttributeName(attribute.name);
                    setIsEditModalOpen(true);
                  }}
                  className="text-blue-500 hover:text-blue-700 mr-2"
                >
                  <Pencil className="inline-block" />
                </button>
                <button
                  onClick={() => handleDeleteAttribute(attribute.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="inline-block" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de Creación */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Crear Nuevo Atributo
              </h3>
              <div className="mt-2 px-7 py-3">
                <input
                  type="text"
                  value={newAttributeName}
                  onChange={(e) => setNewAttributeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Nombre del atributo"
                />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleCreateAttribute}
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

      {/* Modal de Edición */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Editar Atributo
              </h3>
              <div className="mt-2 px-7 py-3">
                <input
                  type="text"
                  value={newAttributeName}
                  onChange={(e) => setNewAttributeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Nombre del atributo"
                />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleUpdateAttribute}
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
