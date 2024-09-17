import React from 'react';
import MainTable from './MainTable'; // Asegúrate de ajustar la ruta correcta
import SubTable from './SubTable';
import { mockProductService } from '../data';
import { Product } from '@/@types/products';

const MainComponent = () => {
  const [supplies, setSupplies] = React.useState<Product[]>([]);

  React.useEffect(() => {
    mockProductService.getProducts().then(setSupplies);
  }, []);


  const renderSubComponent = ({ row }) => {
    const variations = row.original.variations || [];
    return <SubTable data={variations} />;
  };

  return (
    <MainTable
      data={supplies}
      renderRowSubComponent={renderSubComponent}
      getRowCanExpand={row => row.original.variations && row.original.variations.length > 0}
    />
  );
};

export default MainComponent;