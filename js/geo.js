// Получение текущего местоположения
async function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Геолокация не поддерживается вашим браузером"));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Отправляем данные через WebRTC
                if (window.sendLocation) {
                    window.sendLocation(
                        position.coords.latitude,
                        position.coords.longitude
                    );
                }
                resolve(position);
            },
            (error) => {
                reject(new Error(getGeolocationError(error)));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Тексты ошибок геолокации
function getGeolocationError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            return "Доступ к геолокации запрещен пользователем";
        case error.POSITION_UNAVAILABLE:
            return "Информация о местоположении недоступна";
        case error.TIMEOUT:
            return "Время ожидания геолокации истекло";
        default:
            return "Произошла неизвестная ошибка";
    }
}

// Экспортируем функции
window.getLocation = getLocation;