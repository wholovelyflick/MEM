// Глобальные переменные для WebRTC
let peerConnection;
let dataChannel;
const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
    ]
};

// Инициализация WebRTC для пользователя
async function initWebRTC() {
    try {
        peerConnection = new RTCPeerConnection(iceServers);
        
        // Создаем канал данных для передачи координат
        dataChannel = peerConnection.createDataChannel('locationData');
        
        // Обработчики ICE кандидатов
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // В реальном проекте здесь нужно отправить кандидата через сигнальный сервер
                console.log("New ICE candidate:", event.candidate);
            }
        };
        
        // Создаем оффер
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // Здесь должен быть код для отправки оффера через сигнальный сервер
        // В нашем случае имитируем прямое соединение
        simulateSignaling(offer);
        
    } catch (error) {
        console.error("WebRTC error:", error);
        throw error;
    }
}

// Инициализация WebRTC для админа
function initAdminWebRTC(callbacks) {
    // Имитация сигнального сервера
    window.receiveOffer = async (offer) => {
        try {
            peerConnection = new RTCPeerConnection(iceServers);
            
            // Обработчик входящего потока
            peerConnection.ontrack = (event) => {
                if (callbacks.onStream) {
                    callbacks.onStream(event.streams[0]);
                }
            };
            
            // Обработчик входящего канала данных
            peerConnection.ondatachannel = (event) => {
                const channel = event.channel;
                channel.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'location' && callbacks.onLocation) {
                        callbacks.onLocation(data);
                    }
                };
            };
            
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            // Имитируем отправку ответа
            simulateAnswer(answer);
            
            if (callbacks.onConnect) {
                callbacks.onConnect(generateUserId());
            }
            
        } catch (error) {
            console.error("Admin WebRTC error:", error);
        }
    };
}

// Запуск камеры пользователя
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: false 
        });
        
        // Добавляем поток в соединение
        stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
        });
        
        return stream;
    } catch (error) {
        console.error("Camera error:", error);
        return null;
    }
}

// Отправка данных о местоположении
function sendLocation(latitude, longitude) {
    if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(JSON.stringify({
            type: 'location',
            userId: generateUserId(),
            latitude,
            longitude,
            timestamp: new Date().toISOString()
        }));
    }
}

// Генератор ID пользователя (упрощенный)
function generateUserId() {
    return Math.random().toString(36).substring(2, 9);
}

// Имитация сигнального сервера (для демонстрации)
function simulateSignaling(offer) {
    // В реальном проекте здесь должен быть WebSocket или другой механизм
    setTimeout(() => {
        if (window.receiveOffer) {
            window.receiveOffer(offer);
        }
    }, 500);
}

function simulateAnswer(answer) {
    setTimeout(() => {
        peerConnection.setRemoteDescription(answer);
    }, 500);
}

// Экспортируем функции для использования в других файлах
window.initWebRTC = initWebRTC;
window.startCamera = startCamera;
window.sendLocation = sendLocation;