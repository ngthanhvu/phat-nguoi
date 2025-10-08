import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ViolationDetail() {
    const router = useRouter();
    const { violationData } = useLocalSearchParams();
    
    // Parse violation data từ params
    const data = violationData ? JSON.parse(violationData) : null;

    if (!data || !data.violations || data.violations.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="dark" backgroundColor="#ffffff" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backButton}>← Quay lại</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chi tiết vi phạm</Text>
                </View>
                <View style={styles.noViolationContainer}>
                    <Text style={styles.noViolationText}>🎉 Chúc mừng!</Text>
                    <Text style={styles.noViolationSubtext}>Không có vi phạm giao thông nào được ghi nhận</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" backgroundColor="#ffffff" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết vi phạm</Text>
            </View>
            
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {/* Thông tin xe */}
                    <View style={styles.vehicleInfoCard}>
                        <Text style={styles.cardTitle}>Thông tin xe</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Biển số:</Text>
                            <Text style={styles.infoValue}>{data.licensePlate}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Loại xe:</Text>
                            <Text style={styles.infoValue}>
                                {data.vehicleType === 'motorcycle' ? 'Xe máy' : 'Ô tô'}
                            </Text>
                        </View>
                    </View>

                    {/* Danh sách vi phạm */}
                    <View style={styles.violationsCard}>
                        <Text style={styles.cardTitle}>Danh sách vi phạm ({data.violations.length})</Text>
                        {data.violations.map((violation, index) => (
                            <View key={index} style={styles.violationCard}>
                                <View style={styles.violationHeader}>
                                    <Text style={styles.violationNumber}>Vi phạm #{index + 1}</Text>
                                    <Text style={[
                                        styles.violationStatus,
                                        violation.status === 'Đã xử phạt' ? styles.statusPaid : styles.statusUnpaid
                                    ]}>
                                        {violation.status}
                                    </Text>
                                </View>
                                
                                <View style={styles.violationContent}>
                                    <View style={styles.violationItem}>
                                        <Text style={styles.violationItemLabel}>Thời gian:</Text>
                                        <Text style={styles.violationItemValue}>{violation.violationTime}</Text>
                                    </View>
                                    
                                    <View style={styles.violationItem}>
                                        <Text style={styles.violationItemLabel}>Địa điểm:</Text>
                                        <Text style={styles.violationItemValue}>{violation.violationLocation}</Text>
                                    </View>
                                    
                                    <View style={styles.violationItem}>
                                        <Text style={styles.violationItemLabel}>Hành vi vi phạm:</Text>
                                        <Text style={styles.violationItemValue}>{violation.violationBehavior}</Text>
                                    </View>
                                    
                                    <View style={styles.violationItem}>
                                        <Text style={styles.violationItemLabel}>Đơn vị phát hiện:</Text>
                                        <Text style={styles.violationItemValue}>{violation.detectionUnit}</Text>
                                    </View>
                                    
                                    {violation.resolutionPlaces && violation.resolutionPlaces.length > 0 && (
                                        <View style={styles.violationItem}>
                                            <Text style={styles.violationItemLabel}>Nơi giải quyết:</Text>
                                            {violation.resolutionPlaces.map((place, placeIndex) => (
                                                <View key={placeIndex} style={styles.resolutionPlace}>
                                                    <Text style={styles.resolutionPlaceName}>{place.name}</Text>
                                                    {place.address && (
                                                        <Text style={styles.resolutionPlaceAddress}>{place.address}</Text>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        fontSize: 16,
        color: '#3b82f6',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    vehicleInfoCard: {
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
    violationsCard: {
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
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
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
    violationCard: {
        backgroundColor: '#fef2f2',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#dc2626',
    },
    violationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    violationNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#dc2626',
    },
    violationStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    violationContent: {
        gap: 12,
    },
    violationItem: {
        marginBottom: 8,
    },
    violationItemLabel: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '600',
        marginBottom: 4,
    },
    violationItemValue: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    resolutionPlace: {
        marginTop: 8,
        paddingLeft: 12,
        borderLeftWidth: 2,
        borderLeftColor: '#dc2626',
    },
    resolutionPlaceName: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
        marginBottom: 2,
    },
    resolutionPlaceAddress: {
        fontSize: 12,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    noViolationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    noViolationText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#16a34a',
        marginBottom: 16,
    },
    noViolationSubtext: {
        fontSize: 16,
        color: '#16a34a',
        textAlign: 'center',
        lineHeight: 24,
    },
    // Status styles
    statusPaid: {
        color: '#16a34a',
        backgroundColor: '#dcfce7',
    },
    statusUnpaid: {
        color: '#dc2626',
        backgroundColor: '#fecaca',
    },
});
