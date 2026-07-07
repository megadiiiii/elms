import axios from 'axios';

const axiosClient = axios.create({
    //URL thực tế của backend (thông qua proxy của Vite khi chạy local/ngrok)
    baseURL: '/api', 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động găm Token vào header trước khi request bay đi
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Bốc token từ ví trình duyệt ra
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Nhét hộ chiếu vào
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosClient;