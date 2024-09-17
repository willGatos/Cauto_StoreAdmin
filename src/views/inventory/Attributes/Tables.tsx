import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Attribute, Category, AttributeValue } from '@/@types/category';
import supabase from '@/services/Supabase/BaseClient';
import { supabaseService } from '@/services/Supabase/AttributeService';

// Mock service
const mockService = {
    getCategories: (): Promise<Category[]> => {
      return Promise.resolve([
        {
          id: 1,
          name: "Electrónicos",
          description: "Dispositivos electrónicos y accesorios",
          created_at: "2023-01-01T00:00:00Z",
          parent_id: null,
          subcategories: [
            {
              id: 2,
              name: "Smartphones",
              description: "Teléfonos móviles y accesorios",
              created_at: "2023-01-02T00:00:00Z",
              parent_id: 1
            },
            {
              id: 3,
              name: "Laptops",
              description: "Computadoras portátiles",
              created_at: "2023-01-03T00:00:00Z",
              parent_id: 1
            }
          ]
        },
        {
          id: 4,
          name: "Ropa",
          description: "Prendas de vestir y artículos de moda",
          created_at: "2023-01-04T00:00:00Z",
          parent_id: null,
          subcategories: [
            {
              id: 5,
              name: "Ropa para hombre",
              description: "Prendas para caballeros",
              created_at: "2023-01-05T00:00:00Z",
              parent_id: 4
            },
            {
              id: 6,
              name: "Ropa para mujer",
              description: "Prendas para damas",
              created_at: "2023-01-06T00:00:00Z",
              parent_id: 4
            }
          ]
        }
      ]);
    },
    getAttributes: (): Promise<Attribute[]> => {
      return Promise.resolve([
        {
          id: 1,
          name: "Color",
          created_at: "2023-01-01T00:00:00Z",
          values: [
            {
              id: 1,
              type: 1,
              value: "Rojo",
              created_at: "2023-01-02T00:00:00Z"
            },
            {
              id: 2,
              type: 1,
              value: "Azul",
              created_at: "2023-01-03T00:00:00Z"
            }
          ]
        },
        {
          id: 2,
          name: "Talla",
          created_at: "2023-01-04T00:00:00Z",
          values: [
            {
              id: 3,
              type: 2,
              value: "S",
              created_at: "2023-01-05T00:00:00Z"
            },
            {
              id: 4,
              type: 2,
              value: "M",
              created_at: "2023-01-06T00:00:00Z"
            }
          ]
        }
      ]);
    }
  };

const USE_MOCK_DATA = supabase;

const dataService = supabaseService;
//USE_MOCK_DATA ? mockService :

export default function Component() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
    const [expandedAttributes, setExpandedAttributes] = useState<Record<number, boolean>>({});
  
    useEffect(() => {
      dataService.getCategories().then(setCategories);
      dataService.getAttributes().then(setAttributes);
    }, []);
  
    const toggleCategory = (id: number) => {
      setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };
  
    const toggleAttribute = (id: number) => {
      setExpandedAttributes(prev => ({ ...prev, [id]: !prev[id] }));
    };
  
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
  
    const renderCategories = (categories: Category[], depth = 0) => {
      return categories.map(category => (
        <React.Fragment key={category.id}>
          <tr className={`hover:bg-gray-50 ${depth > 0 ? 'bg-gray-100' : ''}`}>
            <td className="py-2 px-4 border-b" style={{ paddingLeft: `${1 + depth * 2}rem` }}>
              {category.subcategories && category.subcategories.length > 0 && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="focus:outline-none"
                  aria-label={expandedCategories[category.id] ? "Contraer categoría" : "Expandir categoría"}
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
            <td className="py-2 px-4 border-b">{formatDate(category.created_at)}</td>
          </tr>
          {expandedCategories[category.id] && category.subcategories && category.subcategories.length > 0 && (
            renderCategories(category.subcategories, depth + 1)
          )}
        </React.Fragment>
      ));
    };
  
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
        
        {/* Categorías Table */}
        <h2 className="text-2xl font-bold mb-4">Categorías</h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left"></th>
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Nombre</th>
                <th className="py-2 px-4 border-b text-left">Descripción</th>
                <th className="py-2 px-4 border-b text-left">Fecha de Creación</th>
              </tr>
            </thead>
            <tbody>
              {renderCategories(categories)}
            </tbody>
          </table>
        </div>
  
        {/* Atributos Table */}
        <h2 className="text-2xl font-bold mb-4">Atributos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left"></th>
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Nombre</th>
                <th className="py-2 px-4 border-b text-left">Fecha de Creación</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map(attribute => (
                <React.Fragment key={attribute.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {attribute.values && attribute.values.length > 0 && (
                        <button
                          onClick={() => toggleAttribute(attribute.id)}
                          className="focus:outline-none"
                          aria-label={expandedAttributes[attribute.id] ? "Contraer atributo" : "Expandir atributo"}
                        >
                          {expandedAttributes[attribute.id] ? (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">{attribute.id}</td>
                    <td className="py-2 px-4 border-b">{attribute.name}</td>
                    <td className="py-2 px-4 border-b">{formatDate(attribute.created_at)}</td>
                  </tr>
                  {expandedAttributes[attribute.id] && attribute.values && attribute.values.length > 0 && (
                    <tr>
                      <td colSpan={4} className="py-2 px-4 border-b">
                        <table className="min-w-full bg-gray-50">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="py-2 px-4 border-b text-left">ID</th>
                              <th className="py-2 px-4 border-b text-left">Valor</th>
                              <th className="py-2 px-4 border-b text-left">Fecha de Creación</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attribute.values.map(value => (
                              <tr key={value.id} className="hover:bg-gray-100">
                                <td className="py-2 px-4 border-b">{value.id}</td>
                                <td className="py-2 px-4 border-b">{value.value}</td>
                                <td className="py-2 px-4 border-b">{formatDate(value.created_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
