import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import { initDatabase, saveSearchHistory, getSearchHistory, clearAllSearchHistory } from '../../lib/services/database';
import { searchViolation, testAPIConnection } from '../../lib/services/api';

export default function Home() {
    const router = useRouter();
    const [licensePlate, setLicensePlate] = useState('');
    const [selectedVehicleType, setSelectedVehicleType] = useState('car');
    const [violationData, setViolationData] = useState(null);
    const [searchHistory, setSearchHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            // Khởi tạo database
            await initDatabase();
            // Load lịch sử tra cứu
            await loadSearchHistory();
            
            // Test kết nối API
            console.log('Testing API connection...');
            const apiConnected = await testAPIConnection();
            if (!apiConnected) {
                console.warn('API connection test failed. Check your backend server.');
            } else {
                console.log('API connection test successful.');
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            Alert.alert('Lỗi', 'Không thể khởi tạo ứng dụng. Vui lòng thử lại.');
        }
    };

    const loadSearchHistory = async () => {
        try {
            const history = await getSearchHistory();
            setSearchHistory(history);
        } catch (error) {
            console.error('Error loading search history:', error);
        }
    };

    const vehicleTypes = [
        { label: 'Xe máy', value: 'motorcycle' },
        { label: 'Ô tô', value: 'car' }
    ];

    const handleSearch = async () => {
        if (!licensePlate.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập biển số xe');
            return;
        }

        if (!selectedVehicleType) {
            Alert.alert('Lỗi', 'Vui lòng chọn loại xe');
            return;
        }

        setLoading(true);
        try {
            // Gọi API tra cứu phạt nguội
            const result = await searchViolation(
                licensePlate.trim(),
                selectedVehicleType === 'motorcycle' ? 'motorcycle' : undefined
            );
            
            // Lưu vào lịch sử tra cứu (vẫn lưu đúng loại đã chọn)
            await saveSearchHistory(licensePlate.trim(), selectedVehicleType);
            
            setViolationData(result);
            await loadSearchHistory(); // Reload lịch sử
            
            // Nếu có vi phạm, chuyển đến màn hình chi tiết
            if (result.violations && result.violations.length > 0) {
                router.push({
                    pathname: '/violation-detail',
                    params: {
                        violationData: JSON.stringify(result)
                    }
                });
            }
        } catch (error) {
            console.error('Error searching violation:', error);
            Alert.alert('Lỗi', 'Không thể tra cứu. Vui lòng kiểm tra kết nối mạng và thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setLicensePlate('');
        setSelectedVehicleType('');
        setViolationData(null);
    };

    const handleHistorySelect = (item) => {
        setLicensePlate(item.license_plate);
        setSelectedVehicleType(item.vehicle_type);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Tra cứu phạt nguội</Text>
                        <Text style={styles.subtitle}>Nhập biển số xe để tra cứu vi phạm giao thông</Text>
                    </View>

                    {/* Input Section */}
                    <View style={styles.inputSection}>
                        {/* License Plate Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Biển số xe</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập biển số xe (VD: 30A-12345)"
                                value={licensePlate}
                                onChangeText={setLicensePlate}
                                autoCapitalize="characters"
                            />
                        </View>

                        {/* Vehicle Type Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Loại xe</Text>
                            <View style={styles.vehicleTypeContainer}>
                                {vehicleTypes.map((type, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.vehicleTypeButton,
                                            selectedVehicleType === type.value && styles.vehicleTypeButtonSelected
                                        ]}
                                        onPress={() => setSelectedVehicleType(type.value)}
                                    >
                                        <Text style={[
                                            styles.vehicleTypeText,
                                            selectedVehicleType === type.value && styles.vehicleTypeTextSelected
                                        ]}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity 
                                style={[styles.searchButton, loading && styles.searchButtonDisabled]} 
                                onPress={handleSearch}
                                disabled={loading}
                            >
                                <Text style={styles.searchButtonText}>
                                    {loading ? 'Đang tra cứu...' : 'Tìm kiếm'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                                <Text style={styles.clearButtonText}>Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search History */}
                    {searchHistory.length > 0 && (
                        <View style={styles.historySection}>
                            <View style={styles.historyHeaderRow}>
                                <Text style={styles.historyTitle}>Lịch sử tra cứu</Text>
                                <TouchableOpacity onPress={async () => {
                                    try {
                                        await clearAllSearchHistory();
                                        await loadSearchHistory();
                                        Alert.alert('Đã xóa', 'Đã xóa lịch sử tra cứu');
                                    } catch (e) {
                                        Alert.alert('Lỗi', 'Không thể xóa lịch sử');
                                    }
                                }}>
                                    <Text style={styles.clearHistoryText}>Xóa lịch sử</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.historyList}>
                                {searchHistory.slice(0, 5).map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.historyItem}
                                        onPress={() => handleHistorySelect(item)}
                                    >
                                        <Text style={styles.historyPlate}>{item.license_plate}</Text>
                                        <Text style={styles.historyType}>
                                            {item.vehicle_type === 'motorcycle' ? 'Xe máy' : 'Ô tô'}
                                        </Text>
                                        <Text style={styles.historyCount}>{item.search_count} lần</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* No violation message - chỉ hiển thị khi không có vi phạm */}
                    {violationData && (!violationData.violations || violationData.violations.length === 0) && (
                        <View style={styles.infoSection}>
                            <View style={styles.noViolationContainer}>
                                <Text style={styles.noViolationText}>🎉 Chúc mừng!</Text>
                                <Text style={styles.noViolationSubtext}>Không có vi phạm giao thông nào được ghi nhận</Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    inputSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    vehicleTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    vehicleTypeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#f9fafb',
    },
    vehicleTypeButtonSelected: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    vehicleTypeText: {
        fontSize: 14,
        color: '#6b7280',
    },
    vehicleTypeTextSelected: {
        color: 'white',
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    searchButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    searchButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    searchButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#ef4444',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    clearButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    infoSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    infoCard: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '600',
        flex: 2,
        textAlign: 'right',
    },
    statusText: {
        fontWeight: 'bold',
    },
    statusValid: {
        color: '#10b981',
    },
    statusExpiring: {
        color: '#f59e0b',
    },
    // History styles
    historySection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    historyHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    clearHistoryText: {
        fontSize: 14,
        color: '#ef4444',
        fontWeight: '600',
    },
    historyList: {
        gap: 8,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#3b82f6',
    },
    historyPlate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        flex: 1,
    },
    historyType: {
        fontSize: 12,
        color: '#6b7280',
        marginRight: 8,
    },
    historyCount: {
        fontSize: 12,
        color: '#6b7280',
    },
    // Violation styles
    violationsContainer: {
        marginTop: 16,
    },
    violationsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#dc2626',
        marginBottom: 12,
    },
    violationItem: {
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#dc2626',
    },
    violationTime: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#dc2626',
        marginBottom: 4,
    },
    violationLocation: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    violationBehavior: {
        fontSize: 12,
        color: '#374151',
        marginBottom: 4,
    },
    violationStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#dc2626',
    },
    noViolationContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
        marginTop: 16,
    },
    noViolationText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#16a34a',
        marginBottom: 8,
    },
    noViolationSubtext: {
        fontSize: 14,
        color: '#16a34a',
        textAlign: 'center',
    },
});
