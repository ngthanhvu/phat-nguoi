import { View, Text, Image, StyleSheet } from 'react-native';

export default function Header() {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../../assets/raw.png')} 
                        style={styles.logoIcon}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>Tra cứu phạt nguội</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        paddingTop: 10,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        width: 40,
        height: 40,
        marginRight: 12,
    },
    appName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937', // Dark gray text
    },
});
