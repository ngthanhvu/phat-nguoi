import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Loading() {
    const router = useRouter();

    useEffect(() => {
        // Hiển thị loading trong 3 giây rồi chuyển đến home
        const timer = setTimeout(() => {
            router.replace('/home');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo - Hiển thị trực tiếp không có container trắng */}
                <Image 
                    source={require('../assets/logo_phat_nguoi.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                />
                
                {/* Text */}
                {/* <Text style={styles.title}>Tra cứu phạt nguội</Text> */}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#008C4A', // Màu xanh lá như trong ảnh
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});