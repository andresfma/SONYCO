import { useNotifications } from '../../context/NotificationContext';

export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();

  const notifySuccess = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  };

  const notifyError = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration
    });
  };

  const notifyWarning = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  };

  const notifyInfo = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  };

  // Helpers específicos para acciones comunes
  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const entityArticles: Record<string, string> = {
    venta: 'La',
    categoria: 'La',
  };

  const entityDisplayNames: Record<string, string> = {
    venta: 'Venta',
    categoria: 'Categoría',
  };

  const notifyEntityCreated = (entityName: string) => {
    const article = entityArticles[entityName.toLowerCase()] || 'El';
    const displayName = entityDisplayNames[entityName.toLowerCase()] || capitalizeFirst(entityName);

    notifySuccess(
      `${displayName} creado`,
      `${article} ${displayName.toLowerCase()} se ha creado exitosamente`
    );
  };

  const notifyEntityUpdated = (entityName: string) => {
    const article = entityArticles[entityName.toLowerCase()] || 'El';
    const displayName = entityDisplayNames[entityName.toLowerCase()] || capitalizeFirst(entityName);

    notifySuccess(
      `${displayName} actualizado`,
      `${article} ${displayName.toLowerCase()} se ha actualizado exitosamente`
    );
  };

  const notifyEntityDeleted = (entityName: string) => {
    const article = entityArticles[entityName.toLowerCase()] || 'El';
    const displayName = entityDisplayNames[entityName.toLowerCase()] || capitalizeFirst(entityName);

    notifySuccess(
      `${displayName} eliminado`,
      `${article} ${displayName.toLowerCase()} se ha eliminado exitosamente`
    );
  };

  const notifyEntityError = (action: string, entityName: string, error?: string) => {
    notifyError(
      `Error al ${action} ${entityName.toLowerCase()}`,
      error || `Ocurrió un error inesperado`
    );
  };

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyEntityCreated,
    notifyEntityUpdated,
    notifyEntityDeleted,
    notifyEntityError
  };
};