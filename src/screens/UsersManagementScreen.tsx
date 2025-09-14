import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { User, UserForm, getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { Role, getRoles } from '../services/roleService';
import { useAuth } from '../contexts/AuthContext';
import { canManageUsers } from '../utils/permissions';

const UsersManagementScreen: React.FC = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    // Check if user has permission to manage users
    if (!canManageUsers(user)) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.accessDeniedContainer}>
                    <Text style={styles.accessDeniedTitle}>Access Denied</Text>
                    <Text style={styles.accessDeniedMessage}>
                        You don't have permission to manage users.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchName, setSearchName] = useState('');
    const [searchMobile, setSearchMobile] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);

    const [formData, setFormData] = useState<UserForm>({
        fullName: '',
        mobile: '',
        password: '',
        roleId: '',
    });

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await getUsers({
                page: currentPage,
                limit: 10,
                search: searchName || searchMobile ? `${searchName} ${searchMobile}`.trim() : undefined,
                roleId: selectedRole || undefined,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });

            setUsers(response.users);
            setTotalPages(response.pagination.totalPages);
            setHasNextPage(response.pagination.hasNextPage);
            setHasPrevPage(response.pagination.hasPrevPage);
        } catch (error: any) {
            console.error('❌ Users Management Error:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            Alert.alert('Error', `Failed to load users: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const loadRoles = async () => {
        try {
            const response = await getRoles({ limit: 100 });
            setRoles(response.roles);
        } catch (error: any) {
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadUsers();
            loadRoles();
        }, [currentPage, searchName, searchMobile, selectedRole])
    );

    const handleCloseModal = () => {
        setModalVisible(false);
        setEditingUser(null);
        setFormData({
            fullName: '',
            mobile: '',
            password: '',
            roleId: '',
        });
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            fullName: user.fullName,
            mobile: user.mobile,
            password: '',
            roleId: user.roleId?._id || '',
        });
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!formData.fullName.trim() || !formData.mobile.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            if (editingUser) {
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete (updateData as any).password;
                }
                await updateUser(editingUser._id, updateData);
                Alert.alert('Success', 'User updated successfully');
            } else {
                if (!formData.password.trim()) {
                    Alert.alert('Error', 'Password is required for new users');
                    return;
                }
                await createUser(formData);
                Alert.alert('Success', 'User created successfully');
            }

            handleCloseModal();
            loadUsers();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save user');
        }
    };

    const handleDelete = (user: User) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${user.fullName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUser(user._id);
                            Alert.alert('Success', 'User deleted successfully');
                            loadUsers();
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete user');
                        }
                    },
                },
            ]
        );
    };

    const filterUsers = () => {
        setCurrentPage(1);
        loadUsers();
    };

    const clearFilters = () => {
        setSearchName('');
        setSearchMobile('');
        setSelectedRole('');
        setCurrentPage(1);
    };

    const renderUser = ({ item }: { item: User }) => (
        <View style={styles.userCard}>
            <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.fullName}</Text>
                    <Text style={styles.userMobile}>{item.mobile}</Text>
                    {item.roleId && (
                        <View style={styles.roleContainer}>
                            <Text style={styles.roleText}>{item.roleId.roleConst}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.userActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEdit(item)}
                    >
                        <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDelete(item)}
                    >
                        <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.userMeta}>
                <Text style={styles.metaText}>
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.metaText}>
                    Updated: {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );

    const renderRoleOption = (role: Role) => (
        <TouchableOpacity
            key={role._id}
            style={styles.roleOption}
            onPress={() => setFormData({ ...formData, roleId: role._id })}
        >
            <Text style={[
                styles.roleOptionText,
                formData.roleId === role._id && styles.selectedRoleOptionText
            ]}>
                {role.roleConst}
            </Text>
        </TouchableOpacity>
    );

    if (loading && users.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.babyBlue} />
                    <Text style={styles.loadingText}>Loading users...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerTitle}>Users</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.addButtonText}>+ Add User</Text>
                </TouchableOpacity>
            </View>

            {/* Search Section */}
            <View style={styles.searchSection}>
                <View style={styles.searchRow}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name..."
                        value={searchName}
                        onChangeText={setSearchName}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by mobile..."
                        value={searchMobile}
                        onChangeText={setSearchMobile}
                    />
                </View>
                <View style={styles.filterRow}>
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownLabel}>Role:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <TouchableOpacity
                                style={[
                                    styles.chip,
                                    !selectedRole && styles.chipActive
                                ]}
                                onPress={() => setSelectedRole('')}
                            >
                                <Text style={[
                                    styles.chipText,
                                    !selectedRole && styles.chipTextActive
                                ]}>
                                    All Roles
                                </Text>
                            </TouchableOpacity>
                            {roles.map(role => (
                                <TouchableOpacity
                                    key={role._id}
                                    style={[
                                        styles.chip,
                                        selectedRole === role._id && styles.chipActive
                                    ]}
                                    onPress={() => setSelectedRole(role._id)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        selectedRole === role._id && styles.chipTextActive
                                    ]}>
                                        {role.roleConst}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
                <View style={styles.searchActions}>
                    <TouchableOpacity style={styles.searchButton} onPress={filterUsers}>
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={users}
                renderItem={renderUser}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshing={loading}
                onRefresh={loadUsers}
            />

            {/* Pagination */}
            <View style={styles.pagination}>
                <TouchableOpacity
                    style={[styles.paginationButton, !hasPrevPage && styles.paginationButtonDisabled]}
                    onPress={() => setCurrentPage(currentPage - 1)}
                    disabled={!hasPrevPage}
                >
                    <Text style={[styles.paginationButtonText, !hasPrevPage && styles.paginationButtonTextDisabled]}>
                        Previous
                    </Text>
                </TouchableOpacity>

                <Text style={styles.paginationInfo}>
                    Page {currentPage} of {totalPages}
                </Text>

                <TouchableOpacity
                    style={[styles.paginationButton, !hasNextPage && styles.paginationButtonDisabled]}
                    onPress={() => setCurrentPage(currentPage + 1)}
                    disabled={!hasNextPage}
                >
                    <Text style={[styles.paginationButtonText, !hasNextPage && styles.paginationButtonTextDisabled]}>
                        Next
                    </Text>
                </TouchableOpacity>
            </View>

            {/* User Form Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </Text>
                        <TouchableOpacity onPress={handleCloseModal}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.fullName}
                                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                                placeholder="Enter full name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Mobile Number *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.mobile}
                                onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                                placeholder="Enter mobile number"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Password {editingUser ? '(leave empty to keep current)' : '*'}
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                placeholder={editingUser ? 'Enter new password' : 'Enter password'}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Role</Text>
                            <ScrollView style={styles.roleOptions}>
                                {renderRoleOption({ _id: '', roleConst: 'No Role', createdAt: '', updatedAt: '' })}
                                {roles.map(renderRoleOption)}
                            </ScrollView>
                        </View>
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                            <Text style={styles.saveButtonText}>
                                {editingUser ? 'Update' : 'Create'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        minHeight: 80,
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        backgroundColor: colors.babyBlue,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.babyBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    backButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 10,
        marginLeft: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.grayDark,
        flex: 2,
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: colors.orange,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.orange,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    addButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 10,
    },
    searchSection: {
        backgroundColor: colors.white,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    searchRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    filterRow: {
        marginBottom: 15,
    },
    dropdownContainer: {
        marginBottom: 10,
    },
    dropdownLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.grayDark,
        marginBottom: 8,
    },
    chip: {
        backgroundColor: colors.grayLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
    },
    chipActive: {
        backgroundColor: colors.babyBlue,
    },
    chipText: {
        color: colors.grayDark,
        fontSize: 14,
    },
    chipTextActive: {
        color: colors.white,
    },
    searchActions: {
        flexDirection: 'row',
        gap: 10,
    },
    searchButton: {
        backgroundColor: colors.babyBlue,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        flex: 1,
    },
    searchButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    clearButton: {
        backgroundColor: colors.grayLight,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        flex: 1,
    },
    clearButtonText: {
        color: colors.grayDark,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    listContainer: {
        padding: 20,
    },
    userCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.grayDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flex: 1,
        marginRight: 12,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.grayDark,
        marginBottom: 4,
    },
    userMobile: {
        fontSize: 16,
        color: colors.grayMedium,
        marginBottom: 8,
    },
    roleContainer: {
        backgroundColor: colors.babyBlueLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.babyBlue,
    },
    userActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    editButton: {
        backgroundColor: colors.green,
    },
    deleteButton: {
        backgroundColor: colors.red,
    },
    actionButtonText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    userMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metaText: {
        fontSize: 12,
        color: colors.grayMedium,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    paginationButton: {
        backgroundColor: colors.babyBlue,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    paginationButtonDisabled: {
        backgroundColor: colors.grayLight,
    },
    paginationButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    paginationButtonTextDisabled: {
        color: colors.grayMedium,
    },
    paginationInfo: {
        fontSize: 14,
        color: colors.grayDark,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: colors.grayDark,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.grayDark,
    },
    closeButton: {
        fontSize: 24,
        color: colors.grayMedium,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.grayDark,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: colors.white,
    },
    roleOptions: {
        maxHeight: 120,
    },
    roleOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    roleOptionText: {
        fontSize: 16,
        color: colors.grayDark,
    },
    selectedRoleOptionText: {
        color: colors.babyBlue,
        fontWeight: 'bold',
    },
    modalActions: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.grayLight,
        paddingVertical: 12,
        borderRadius: 8,
    },
    cancelButtonText: {
        color: colors.grayDark,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    saveButton: {
        flex: 1,
        backgroundColor: colors.babyBlue,
        paddingVertical: 12,
        borderRadius: 8,
    },
    saveButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    accessDeniedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    accessDeniedTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.red,
        marginBottom: 16,
    },
    accessDeniedMessage: {
        fontSize: 16,
        color: colors.grayDark,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default UsersManagementScreen;
