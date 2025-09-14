import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    TextInput,
    Modal,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { getUserRole, getUserPermissions } from '../utils/permissions';

export default function ProfileScreen() {
    const { user, logout, updateProfile, refreshUserRole } = useAuth();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: user?.fullName || '',
        mobile: user?.mobile || '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleEditProfile = () => {
        setEditForm({
            fullName: user?.fullName || '',
            mobile: user?.mobile || '',
        });
        setIsEditModalVisible(true);
    };

    const handleSaveProfile = async () => {
        if (!editForm.fullName.trim()) {
            Alert.alert('Error', 'Please enter your full name');
            return;
        }
        if (!editForm.mobile.trim()) {
            Alert.alert('Error', 'Please enter your mobile number');
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile({
                fullName: editForm.fullName.trim(),
                mobile: editForm.mobile.trim(),
            });
            setIsEditModalVisible(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Image
                            source={require('../../assets/ThinkLink.png')}
                            style={styles.avatarImage}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.userName}>{user?.fullName}</Text>
                    <Text style={styles.userMobile}>{user?.mobile}</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Account Information</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Full Name:</Text>
                            <Text style={styles.infoValue}>{user?.fullName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Mobile:</Text>
                            <Text style={styles.infoValue}>{user?.mobile}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Member Since:</Text>
                            <Text style={styles.infoValue}>
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Role:</Text>
                            <Text style={[styles.infoValue, styles.roleValue]}>
                                {getUserRole(user)} {user?.roleId?.roleConst ? `(${user.roleId.roleConst})` : '(No role assigned)'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Actions</Text>
                        <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
                            <Text style={styles.actionButtonText}>✏️ Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={refreshUserRole}>
                            <Text style={styles.actionButtonText}>🔄 Refresh Role</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>🔒 Change Password</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>📱 App Settings</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Support</Text>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>❓ Help & Support</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>📄 Terms & Privacy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>ℹ️ About</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>🚪 Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                            <Text style={styles.modalCancelButton}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        <TouchableOpacity onPress={handleSaveProfile} disabled={isLoading}>
                            <Text style={[styles.modalSaveButton, isLoading && styles.modalSaveButtonDisabled]}>
                                {isLoading ? 'Saving...' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.fullName}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, fullName: text }))}
                                placeholder="Enter your full name"
                                autoCapitalize="words"
                                maxLength={50}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Mobile Number</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.mobile}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, mobile: text }))}
                                placeholder="Enter your mobile number"
                                keyboardType="phone-pad"
                                maxLength={15}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
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
        paddingBottom: 90, // Add extra padding for floating bottom navigation
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.grayDark,
        marginBottom: 4,
    },
    userMobile: {
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
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.grayDark,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 16,
        color: colors.gray,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        color: colors.grayDark,
        fontWeight: '600',
    },
    actionButton: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    actionButtonText: {
        fontSize: 16,
        color: colors.grayDark,
    },
    logoutButton: {
        backgroundColor: colors.orange,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    logoutButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
        backgroundColor: 'white',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    modalCancelButton: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    modalSaveButton: {
        fontSize: 16,
        color: '#3498db',
        fontWeight: '600',
    },
    modalSaveButtonDisabled: {
        color: '#bdc3c7',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
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
        backgroundColor: 'white',
    },
    roleValue: {
        fontWeight: 'bold',
        color: colors.orange,
    },
});
