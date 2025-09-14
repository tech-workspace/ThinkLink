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
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Role, RoleForm, getRoles, createRole, updateRole, deleteRole, getRolesWithCounts } from '../services/roleService';
import { useAuth } from '../contexts/AuthContext';
import { canManageRoles } from '../utils/permissions';

const RolesManagementScreen: React.FC = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [roles, setRoles] = useState<Role[]>([]);
    const [rolesWithCounts, setRolesWithCounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Check if user has permission to manage roles
    if (!canManageRoles(user)) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.accessDeniedContainer}>
                    <Text style={styles.accessDeniedTitle}>Access Denied</Text>
                    <Text style={styles.accessDeniedMessage}>
                        You don't have permission to manage roles.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);

    const [formData, setFormData] = useState<RoleForm>({
        roleConst: '',
    });

    const loadRoles = async () => {
        try {
            setLoading(true);
            const response = await getRoles({
                page: currentPage,
                limit: 10,
                search: searchText || undefined,
                sortBy: 'roleConst',
                sortOrder: 'asc',
            });

            setRoles(response.roles);
            setTotalPages(response.pagination.totalPages);
            setHasNextPage(response.pagination.hasNextPage);
            setHasPrevPage(response.pagination.hasPrevPage);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    const loadRolesWithCounts = async () => {
        try {
            const response = await getRolesWithCounts();
            setRolesWithCounts(response);
        } catch (error: any) {
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadRoles();
            loadRolesWithCounts();
        }, [currentPage, searchText])
    );

    const handleCloseModal = () => {
        setModalVisible(false);
        setEditingRole(null);
        setFormData({
            roleConst: '',
        });
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData({
            roleConst: role.roleConst,
        });
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!formData.roleConst.trim()) {
            Alert.alert('Error', 'Please enter a role constant');
            return;
        }

        try {
            if (editingRole) {
                await updateRole(editingRole._id, formData);
                Alert.alert('Success', 'Role updated successfully');
            } else {
                await createRole(formData);
                Alert.alert('Success', 'Role created successfully');
            }

            handleCloseModal();
            loadRoles();
            loadRolesWithCounts();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save role');
        }
    };

    const handleDelete = (role: Role) => {
        const roleWithCount = rolesWithCounts.find(r => r._id === role._id);
        const userCount = roleWithCount?.userCount || 0;

        if (userCount > 0) {
            Alert.alert(
                'Cannot Delete Role',
                `This role has ${userCount} user(s) associated with it. Please reassign or remove users before deleting this role.`
            );
            return;
        }

        Alert.alert(
            'Delete Role',
            `Are you sure you want to delete the role "${role.roleConst}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteRole(role._id);
                            Alert.alert('Success', 'Role deleted successfully');
                            loadRoles();
                            loadRolesWithCounts();
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete role');
                        }
                    },
                },
            ]
        );
    };

    const filterRoles = () => {
        setCurrentPage(1);
        loadRoles();
    };

    const clearFilters = () => {
        setSearchText('');
        setCurrentPage(1);
    };

    const renderRole = ({ item }: { item: Role }) => {
        const roleWithCount = rolesWithCounts.find(r => r._id === item._id);
        const userCount = roleWithCount?.userCount || 0;

        return (
            <View style={styles.roleCard}>
                <View style={styles.roleHeader}>
                    <View style={styles.roleInfo}>
                        <Text style={styles.roleName}>{item.roleConst}</Text>
                        <Text style={styles.userCount}>
                            {userCount} user{userCount !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    <View style={styles.roleActions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => handleEdit(item)}
                        >
                            <Text style={styles.actionButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                userCount > 0 ? styles.deleteButtonDisabled : styles.deleteButton
                            ]}
                            onPress={() => handleDelete(item)}
                            disabled={userCount > 0}
                        >
                            <Text style={[
                                styles.actionButtonText,
                                userCount > 0 && styles.actionButtonTextDisabled
                            ]}>
                                Delete
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.roleMeta}>
                    <Text style={styles.metaText}>
                        Created: {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.metaText}>
                        Updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading && roles.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.babyBlue} />
                    <Text style={styles.loadingText}>Loading roles...</Text>
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
                <Text style={styles.headerTitle}>Roles</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.addButtonText}>+ Add Role</Text>
                </TouchableOpacity>
            </View>

            {/* Search Section */}
            <View style={styles.searchSection}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search roles..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
                <View style={styles.searchActions}>
                    <TouchableOpacity style={styles.searchButton} onPress={filterRoles}>
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={roles}
                renderItem={renderRole}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshing={loading}
                onRefresh={loadRoles}
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

            {/* Role Form Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editingRole ? 'Edit Role' : 'Add New Role'}
                        </Text>
                        <TouchableOpacity onPress={handleCloseModal}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Role Constant *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.roleConst}
                                onChangeText={(text) => setFormData({ ...formData, roleConst: text.toUpperCase() })}
                                placeholder="e.g., ADMIN, USER, MODERATOR"
                                autoCapitalize="characters"
                            />
                            <Text style={styles.inputHint}>
                                Use uppercase letters and underscores (e.g., SUPER_ADMIN)
                            </Text>
                        </View>
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                            <Text style={styles.saveButtonText}>
                                {editingRole ? 'Update' : 'Create'}
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
    searchInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 15,
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
    roleCard: {
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
    roleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    roleInfo: {
        flex: 1,
        marginRight: 12,
    },
    roleName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.grayDark,
        marginBottom: 4,
    },
    userCount: {
        fontSize: 14,
        color: colors.babyBlue,
        fontWeight: '600',
    },
    roleActions: {
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
    deleteButtonDisabled: {
        backgroundColor: colors.grayLight,
    },
    actionButtonText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionButtonTextDisabled: {
        color: colors.grayMedium,
    },
    roleMeta: {
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
    inputHint: {
        fontSize: 12,
        color: colors.grayMedium,
        marginTop: 4,
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

export default RolesManagementScreen;
