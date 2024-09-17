import React from 'react';
import SupplySelection from './SupplySelection';
import SupplyVariations from './SupplyVariations';
import useSupplyManagement from '@/hooks/useSupplyManagement';

const SupplyManagement: React.FC = () => {

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            {/* Componente de selección de suministros */}
            <SupplySelection
                supplies={supplies}
                selectedSupplyIds={selectedSupplyIds}
                onSelectionChange={setSelectedSupplyIds}
            />

            {/* Componente de visualización de variaciones de suministros */}
            {selectedSupplyIds.length > 0 && (
                <SupplyVariations supplyVariations={supplyVariations} />
            )}
        </div>
    );
};

export default SupplyManagement;