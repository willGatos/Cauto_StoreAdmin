import React, { useState, useEffect } from 'react';
import { Edit2, X, Check } from 'lucide-react';
import supabase from '@/services/Supabase/BaseClient';
import { Button } from '@/components/ui';
interface Currency {
  id: number;
  name: string;
  exchange_rate: number;
}

// Supabase data service
const supabaseDataService = {
  getCurrencies: async (): Promise<Currency[]> => {
    const { data, error } = await supabase
      .from('currency')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching currencies:', error);
      return [];
    }
    
    return data || [];
  },
  updateCurrency: async (id: number, exchange_rate: number): Promise<Currency> => {
    const { data, error } = await supabase
      .from('currency')
      .update({ exchange_rate })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating currency:', error);
      throw error;
    }

    return data;
  }
};

// Use mock data service
const dataService = supabaseDataService;

export default function CurrencyView() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [newExchangeRate, setNewExchangeRate] = useState<string>('');
  const [updateNotification, setUpdateNotification] = useState<string | null>(null);
  const [isAddingCurrency, setIsAddingCurrency] = useState(false)
  const [newCurrencyName, setNewCurrencyName] = useState('')
  const [newCurrencyRate, setNewCurrencyRate] = useState('')

  useEffect(() => {
    console.log('first')
    dataService.getCurrencies().then(setCurrencies);
  }, []);

  const handleEditClick = (currency: Currency) => {
    setEditingCurrency(currency);
    setNewExchangeRate(currency.exchange_rate.toString());
  };

  const handleCloseModal = () => {
    setEditingCurrency(null);
    setNewExchangeRate('');
  };

  const handleAddCurrency = async () => {
    if (newCurrencyName && newCurrencyRate) {
      // Using mock data service
      // const added = await mockDataService.addCurrency(newCurrencyName, parseFloat(newCurrencyRate))
      
      // Using Supabase
      const { data: added, error } = await supabase
        .from('currency')
        .insert({ name: newCurrencyName, exchange_rate: parseFloat(newCurrencyRate), is_automatic: false})
        .select()
        .single();
      if (error) console.error('Error adding currency:', error)

      setCurrencies([...currencies, added])
      setIsAddingCurrency(false)
      setNewCurrencyName('')
      setNewCurrencyRate('')
    }
  }

  const handleUpdateCurrency = async () => {
    if (editingCurrency && newExchangeRate) {
      try {
        const updatedCurrency = await dataService.updateCurrency(editingCurrency.id, parseFloat(newExchangeRate));
        setCurrencies(currencies.map(c => c.id === updatedCurrency.id ? updatedCurrency : c));
        handleCloseModal();
        setUpdateNotification(`${updatedCurrency.name} actualizado correctamente`);
        setTimeout(() => setUpdateNotification(null), 3000);
      } catch (error) {
        console.error('Error updating currency:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Divisas</h1>
      
      {updateNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg flex items-center">
          <Check className="h-5 w-5 mr-2" />
          {updateNotification}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currencies.map(currency => (
          <div key={currency.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">{currency.name}</h2>
              <button
                onClick={() => handleEditClick(currency)}
                className="text-blue-500 hover:text-blue-700"
                aria-label={`Editar ${currency.name}`}
              >
                <Edit2 className="h-5 w-5" />
              </button>
            </div>
            <p>Tasa de cambio: {currency.exchange_rate}</p>
          </div>
        ))}
      </div>

      {editingCurrency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Editar {editingCurrency.name}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="exchangeRate" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva tasa de cambio
              </label>
              <input
                type="number"
                id="exchangeRate"
                value={newExchangeRate}
                onChange={(e) => setNewExchangeRate(e.target.value)}
                className="w-full p-2 border rounded"
                step="0.01"
              />
            </div>
            <button
              onClick={handleUpdateCurrency}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Actualizar
            </button>
          </div>
        </div>
      )}
    <Button
        onClick={() => setIsAddingCurrency(true)}
        variant='default'
        className="font-bold py-2 px-4 rounded mb-4 mt-5"
      >
        Añadir Nueva Moneda
      </Button>

{isAddingCurrency && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Añadir Nueva Moneda</h2>
            <input
              type="text"
              placeholder="Nombre de la Moneda"
              value={newCurrencyName}
              onChange={(e) => setNewCurrencyName(e.target.value)}
              className="border rounded p-2 mb-2 w-full"
            />
            <input
              type="number"
              placeholder="Tasa de Cambio"
              value={newCurrencyRate}
              onChange={(e) => setNewCurrencyRate(e.target.value)}
              className="border rounded p-2 mb-4 w-full"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setIsAddingCurrency(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCurrency}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Agregar Moneda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}