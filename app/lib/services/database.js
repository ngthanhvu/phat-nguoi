import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('vehicle_traffic.db');

export const initDatabase = () => {
    try {
        // Tạo bảng users
        db.execSync(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tạo bảng search_history để lưu lịch sử tra cứu
        db.execSync(`
            CREATE TABLE IF NOT EXISTS search_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                license_plate TEXT NOT NULL,
                vehicle_type TEXT NOT NULL,
                search_count INTEGER DEFAULT 1,
                last_searched DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tạo bảng current_user để lưu user hiện tại
        db.execSync(`
            CREATE TABLE IF NOT EXISTS current_user (
                id INTEGER PRIMARY KEY,
                user_id INTEGER,
                FOREIGN KEY (user_id) REFERENCES users (id)
            );
        `);


        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
};

export const createUser = (name, email = null) => {
    try {
        const result = db.runSync('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
        
        // Lưu user hiện tại
        db.runSync('DELETE FROM current_user');
        db.runSync('INSERT INTO current_user (user_id) VALUES (?)', [result.lastInsertRowId]);
        
        return Promise.resolve(result.lastInsertRowId);
    } catch (error) {
        return Promise.reject(error);
    }
};

export const getCurrentUser = () => {
    try {
        const result = db.getAllSync(`
            SELECT u.* FROM users u 
            JOIN current_user cu ON u.id = cu.user_id
        `);
        
        return Promise.resolve(result.length > 0 ? result[0] : null);
    } catch (error) {
        return Promise.reject(error);
    }
};

export const searchVehicle = (licensePlate, vehicleType) => {
    try {
        const result = db.getAllSync(
            'SELECT * FROM vehicles WHERE license_plate = ? AND vehicle_type = ?',
            [licensePlate.toUpperCase(), vehicleType]
        );
        
        return Promise.resolve(result.length > 0 ? result[0] : null);
    } catch (error) {
        return Promise.reject(error);
    }
};

export const addVehicle = (vehicleData) => {
    try {
        const result = db.runSync(
            `INSERT INTO vehicles (license_plate, vehicle_type, owner_name, address, registration_date, expiry_date, status, user_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                vehicleData.license_plate,
                vehicleData.vehicle_type,
                vehicleData.owner_name,
                vehicleData.address,
                vehicleData.registration_date,
                vehicleData.expiry_date,
                vehicleData.status,
                vehicleData.user_id
            ]
        );
        
        return Promise.resolve(result.lastInsertRowId);
    } catch (error) {
        return Promise.reject(error);
    }
};

export const saveSearchHistory = (licensePlate, vehicleType) => {
    try {
        // Kiểm tra xem đã có trong lịch sử chưa
        const existing = db.getAllSync(
            'SELECT * FROM search_history WHERE license_plate = ? AND vehicle_type = ?',
            [licensePlate.toUpperCase(), vehicleType]
        );

        if (existing.length > 0) {
            // Cập nhật số lần tra cứu và thời gian
            db.runSync(
                'UPDATE search_history SET search_count = search_count + 1, last_searched = CURRENT_TIMESTAMP WHERE license_plate = ? AND vehicle_type = ?',
                [licensePlate.toUpperCase(), vehicleType]
            );
        } else {
            // Thêm mới vào lịch sử
            db.runSync(
                'INSERT INTO search_history (license_plate, vehicle_type) VALUES (?, ?)',
                [licensePlate.toUpperCase(), vehicleType]
            );
        }

        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
};

export const getSearchHistory = () => {
    try {
        const result = db.getAllSync('SELECT * FROM search_history ORDER BY last_searched DESC LIMIT 10');
        return Promise.resolve(result);
    } catch (error) {
        return Promise.reject(error);
    }
};

export const deleteSearchHistory = (id) => {
    try {
        db.runSync('DELETE FROM search_history WHERE id = ?', [id]);
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
};

// Xóa toàn bộ lịch sử tra cứu
export const clearAllSearchHistory = () => {
    try {
        db.runSync('DELETE FROM search_history');
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
};