import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface LoginForm {
    mobile: string;
    password: string;
}

interface LoginScreenProps { }

export default function LoginScreen({ }: LoginScreenProps) {
    const { login } = useAuth();
    const [formData, setFormData] = useState<LoginForm>({
        mobile: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field: keyof LoginForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.mobile.trim()) {
            Alert.alert('Error', 'Please enter your mobile number');
            return false;
        }
        if (!formData.password.trim()) {
            Alert.alert('Error', 'Please enter your password');
            return false;
        }
        if (formData.mobile.length < 10) {
            Alert.alert('Error', 'Please enter a valid mobile number');
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {

            // Use auth context login method
            await login(formData.mobile.trim(), formData.password);

            // Success is handled by the auth context - user will be redirected to main app
        } catch (error: any) {
            console.error('Login error:', error.message);
            Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/ThinkLink.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue to your dashboard</Text>
                </View>

                {/* Form Section */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mobile Number</Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>📱</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your mobile number"
                                placeholderTextColor={colors.gray}
                                value={formData.mobile}
                                onChangeText={(value) => handleInputChange('mobile', value)}
                                keyboardType="phone-pad"
                                maxLength={15}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor={colors.gray}
                                value={formData.password}
                                onChangeText={(value) => handleInputChange('password', value)}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Secure login powered by ThinkLink</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.babyBlue,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        minHeight: '100%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
        paddingTop: 40,
    },
    logoContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    logoImage: {
        width: 120,
        height: 120,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: colors.white,
        textAlign: 'center',
        opacity: 0.9,
    },
    form: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 30,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    inputContainer: {
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.grayDark,
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.grayLight,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.babyBlueLight,
        paddingHorizontal: 15,
    },
    inputIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: colors.grayDark,
    },
    loginButton: {
        backgroundColor: colors.orange,
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: colors.orange,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loginButtonDisabled: {
        backgroundColor: colors.gray,
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        alignItems: 'center',
        marginTop: 40,
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.8,
    },
});
