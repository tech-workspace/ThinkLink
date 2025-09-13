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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';

interface SignupForm {
    fullName: string;
    mobile: string;
    password: string;
    confirmPassword: string;
}

interface SignupScreenProps {
    onNavigateToLogin: () => void;
}

export default function SignupScreen({ onNavigateToLogin }: SignupScreenProps) {
    const { signup } = useAuth();
    const [formData, setFormData] = useState<SignupForm>({
        fullName: '',
        mobile: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field: keyof SignupForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.fullName.trim()) {
            Alert.alert('Error', 'Please enter your full name');
            return false;
        }
        if (formData.fullName.trim().length < 2) {
            Alert.alert('Error', 'Full name must be at least 2 characters');
            return false;
        }
        if (!formData.mobile.trim()) {
            Alert.alert('Error', 'Please enter your mobile number');
            return false;
        }
        if (formData.mobile.length < 10) {
            Alert.alert('Error', 'Please enter a valid mobile number');
            return false;
        }
        if (!formData.password.trim()) {
            Alert.alert('Error', 'Please enter a password');
            return false;
        }
        if (formData.password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {

            // Use auth context signup method
            await signup(formData.fullName.trim(), formData.mobile.trim(), formData.password);

            // Success is handled by the auth context - user will be redirected to main app
        } catch (error: any) {
            console.error('Signup error:', error.message);
            Alert.alert('Signup Failed', error.message || 'Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChangeText={(value) => handleInputChange('fullName', value)}
                            autoCapitalize="words"
                            maxLength={50}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mobile Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your mobile number"
                            value={formData.mobile}
                            onChangeText={(value) => handleInputChange('mobile', value)}
                            keyboardType="phone-pad"
                            maxLength={15}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password (min 8 characters)"
                            value={formData.password}
                            onChangeText={(value) => handleInputChange('password', value)}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChangeText={(value) => handleInputChange('confirmPassword', value)}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        <Text style={styles.signupButtonText}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginLink} onPress={onNavigateToLogin}>
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginLinkText}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    form: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e1e8ed',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#f8f9fa',
    },
    signupButton: {
        backgroundColor: '#27ae60',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    signupButtonDisabled: {
        backgroundColor: '#bdc3c7',
    },
    signupButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    loginLink: {
        alignItems: 'center',
        marginTop: 20,
    },
    loginText: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    loginLinkText: {
        color: '#27ae60',
        fontWeight: '600',
    },
});
