import { useState } from 'react';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';

// Hook personalizado para manejar notificaciones
const HandleFeedback = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Función para mostrar la notificación
    const showNotification = (
        type: 'success' | 'warning' | 'danger' | 'info',
        message: string
    ) => {
        const isPersistent = type !== 'info'; // Solo loading será temporal
        const duration = isPersistent ? 0 : 2000; // Persistente o temporal

        toast.push(
            <Notification
                closable={isPersistent} // Solo se puede cerrar si es persistente
                title={type.charAt(0).toUpperCase() + type.slice(1)}
                type={type}
                duration={duration} // Duración de la notificación
            >
                {message}
            </Notification>
        );
    };

    // Manejar el estado de loading
    const handleLoading = (isLoading: boolean) => {
        setLoading(isLoading);
        if (isLoading) {
            showNotification('info', 'Cargando, por favor espera...');
        }
    };

    // Manejar los errores
    const handleError = (errorMessage: string) => {
        setError(errorMessage);
        showNotification('danger', `Error: ${errorMessage}`);
    };

    // Manejar el éxito
    const handleSuccess = (successMessage: string) => {
        setSuccess(successMessage);
        showNotification('success', successMessage);
    };

    return {
        loading,
        error,
        success,
        handleLoading,
        handleError,
        handleSuccess,
    };
};

export default HandleFeedback;
