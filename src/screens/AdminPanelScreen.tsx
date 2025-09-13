import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/colors';

interface AdminPanelScreenProps {
    navigation?: any;
}

export default function AdminPanelScreen({ navigation }: AdminPanelScreenProps) {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Admin Panel</Text>
                    <Text style={styles.subtitle}>Manage your application</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>📝 Questions Management</Text>
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton, styles.fullWidthButton]}
                            onPress={() => navigation?.navigate('QuestionsManagement')}
                        >
                            <Text style={styles.buttonText}>Manage Questions</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🏷️ Categories Management</Text>
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton, styles.fullWidthButton]}
                            onPress={() => navigation?.navigate('CategoriesManagement')}
                        >
                            <Text style={styles.buttonText}>Manage Categories</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        marginBottom: 30,
        paddingTop: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.grayDark,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.gray,
    },
    content: {
        flex: 1,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.grayDark,
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 16,
        color: colors.gray,
        marginBottom: 16,
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    fullWidthButton: {
        flex: 1,
        marginTop: 8,
    },
    primaryButton: {
        backgroundColor: colors.orange,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.orange,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButtonText: {
        color: colors.orange,
        fontSize: 16,
        fontWeight: '600',
    },
});
