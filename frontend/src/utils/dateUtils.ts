export const formatDateLocal = (dateString: string): string => {
    try {
        // Parsear el string ISO con offset
        const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-])(\d{2}):(\d{2})$/);
        
        if (!match) {
            return 'Formato de fecha inválido';
        }

        const [, year, month, day, hour, minute, second, offsetSign, offsetHours, offsetMinutes] = match;
        
        // La fecha viene con el offset ya aplicado (hora local de Colombia)
        // Simplemente parseamos los valores directamente
        const localYear = parseInt(year);
        const localMonth = parseInt(month);
        const localDay = parseInt(day);
        const localHour = parseInt(hour);
        const localMinute = parseInt(minute);
        
        // Crear fecha local para verificar si necesitamos ajustar el día
        const localDate = new Date(localYear, localMonth - 1, localDay, localHour, localMinute, parseInt(second));
        
        // Restar 5 horas para obtener la hora deseada
        localDate.setHours(localDate.getHours() - 5);
        
        // Obtener los valores ajustados (JavaScript maneja automáticamente el cambio de día)
        const adjustedYear = localDate.getFullYear();
        const adjustedMonth = String(localDate.getMonth() + 1).padStart(2, '0');
        const adjustedDay = String(localDate.getDate()).padStart(2, '0');
        const adjustedHour = String(localDate.getHours()).padStart(2, '0');
        const adjustedMinute = String(localDate.getMinutes()).padStart(2, '0');
        
        return `${adjustedDay}/${adjustedMonth}/${adjustedYear} ${adjustedHour}:${adjustedMinute}`;
    } catch (error) {
        return 'Error al procesar fecha';
    }
};

// Versión solo fecha
export const formatDateOnly = (dateString: string): string => {
    try {
        const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-])(\d{2}):(\d{2})$/);
        
        if (!match) {
            return 'Formato de fecha inválido';
        }

        const [, year, month, day, hour, minute, second] = match;
        
        // La fecha viene con el offset ya aplicado (hora local de Colombia)
        const localYear = parseInt(year);
        const localMonth = parseInt(month);
        const localDay = parseInt(day);
        const localHour = parseInt(hour);
        const localMinute = parseInt(minute);
        
        // Crear fecha local y restar 5 horas
        const localDate = new Date(localYear, localMonth - 1, localDay, localHour, localMinute, parseInt(second));
        localDate.setHours(localDate.getHours() - 5);
        
        // Obtener los valores ajustados
        const adjustedYear = localDate.getFullYear();
        const adjustedMonth = String(localDate.getMonth() + 1).padStart(2, '0');
        const adjustedDay = String(localDate.getDate()).padStart(2, '0');
        
        return `${adjustedDay}/${adjustedMonth}/${adjustedYear}`;
    } catch (error) {
        return 'Error al procesar fecha';
    }
};

