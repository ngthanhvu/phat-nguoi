import axios from 'axios';
import { API_CONFIG } from '../config/api';

export const searchViolation = async (licensePlate, vehicleType) => {
    try {
        // Tạo query string thủ công
        let queryString = `licensePlate=${encodeURIComponent(licensePlate.toUpperCase())}`;
        
        // Thêm vehicleType nếu có
        if (vehicleType) {
            queryString += `&vehicleType=${encodeURIComponent(vehicleType)}`;
        }

        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEARCH_VIOLATION}?${queryString}`;
        console.log('API Request URL:', url);

        // Gửi GET request với axios
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json',
            },
            timeout: 10000, // 10 seconds timeout
        });

        console.log('API Response status:', response.status);
        console.log('API Response data:', response.data);
        return response.data;
    } catch (error) {
        console.error('API Error Details:', {
            message: error.message,
            name: error.name,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status
        });
        
        // Kiểm tra loại lỗi
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra URL API và đảm bảo server đang chạy.');
        } else if (error.response) {
            throw new Error(`Lỗi server: ${error.response.status} - ${error.response.data?.message || error.message}`);
        } else if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. Server không phản hồi trong thời gian cho phép.');
        } else {
            throw new Error(`Lỗi không xác định: ${error.message}`);
        }
    }
};

// Function để test kết nối API
export const testAPIConnection = async () => {
    try {
        const url = `${API_CONFIG.BASE_URL}/test`;
        console.log('Testing API connection to:', url);
        
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json',
            },
            timeout: 5000, // 5 seconds timeout for test
        });
        
        console.log('Test API Response status:', response.status);
        console.log('Test API Response data:', response.data);
        
        // Kiểm tra response có đúng format không
        if (response.data && response.data.message === 'API is working') {
            console.log('✅ API test successful - Server is working');
            return true;
        } else {
            console.warn('⚠️ API test response format unexpected:', response.data);
            return false;
        }
    } catch (error) {
        console.error('❌ Test API Error:', error.message);
        return false;
    }
};
