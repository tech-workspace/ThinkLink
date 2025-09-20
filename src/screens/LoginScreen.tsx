import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VERSION_INFO } from '../config/version';

const { width } = Dimensions.get('window');

interface LoginForm {
    mobile: string;
    password: string;
}

const REMEMBER_CREDENTIALS_KEY = 'remembered_credentials';

interface LoginScreenProps { }

export default function LoginScreen({ }: LoginScreenProps) {
    const { login } = useAuth();
    const [formData, setFormData] = useState<LoginForm>({
        mobile: '0568863388',
        password: '123456',
    });
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // Load remembered credentials on component mount
    useEffect(() => {
        loadRememberedCredentials();
    }, []);

    const loadRememberedCredentials = async () => {
        try {
            const remembered = await AsyncStorage.getItem(REMEMBER_CREDENTIALS_KEY);
            if (remembered) {
                const credentials = JSON.parse(remembered);
                setFormData(credentials);
                setRememberMe(true);
            }
        } catch (error) {
            // Silent error handling for loading credentials
        }
    };

    const saveCredentials = async (credentials: LoginForm) => {
        try {
            await AsyncStorage.setItem(REMEMBER_CREDENTIALS_KEY, JSON.stringify(credentials));
        } catch (error) {
            // Silent error handling for saving credentials
        }
    };

    const clearCredentials = async () => {
        try {
            await AsyncStorage.removeItem(REMEMBER_CREDENTIALS_KEY);
        } catch (error) {
            // Silent error handling for clearing credentials
        }
    };

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

            // Save credentials if remember me is checked
            if (rememberMe) {
                await saveCredentials(formData);
            } else {
                await clearCredentials();
            }

            // Success is handled by the auth context - user will be redirected to main app
        } catch (error: any) {
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

                    {/* Remember Me Checkbox */}
                    <TouchableOpacity
                        style={styles.rememberMeContainer}
                        onPress={() => setRememberMe(!rememberMe)}
                    >
                        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                            {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.rememberMeText}>Remember me</Text>
                    </TouchableOpacity>

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
                    <Text style={styles.versionText}>{VERSION_INFO.displayVersion}</Text>
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
        padding: 15,
        minHeight: '100%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 20,
    },
    logoContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    logoImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 6,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: colors.white,
        textAlign: 'center',
        opacity: 0.9,
    },
    form: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    inputContainer: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.grayDark,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.grayLight,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.babyBlueLight,
        paddingHorizontal: 12,
    },
    inputIcon: {
        fontSize: 16,
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.grayDark,
    },
    loginButton: {
        backgroundColor: colors.orange,
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        marginTop: 15,
        shadowColor: colors.orange,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    loginButtonDisabled: {
        backgroundColor: colors.gray,
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 5,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderColor: colors.gray,
        borderRadius: 4,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkboxChecked: {
        backgroundColor: colors.orange,
        borderColor: colors.orange,
    },
    checkmark: {
        color: colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    rememberMeText: {
        color: colors.grayDark,
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
        paddingBottom: 10,
    },
    footerText: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.8,
    },
    versionText: {
        fontSize: 12,
        color: colors.white,
        opacity: 0.6,
        marginTop: 4,
        fontWeight: '500',
    },
});
