import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Alert,
    Modal,
    FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from '../services/categoryService';
import { useAuth } from '../contexts/AuthContext';
import { canManageCategories } from '../utils/permissions';

// Category interface is now imported from categoryService

interface CategoryForm {
    name: string;
    color: string;
    icon: string;
    isActive: boolean;
}

const PREDEFINED_COLORS = [
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
];

const EXPO_ICONS = [
    '🎉', // fun
    '📖', // quraan
    '☪️', // islamic
    '⚽', // sport
    '📋', // general
    '⭐', // generic 1
    '🔷', // generic 2
    '💫', // generic 3
];

export default function CategoriesManagementScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryForm>({
        name: '',
        color: '#0000FF', // Blue
        icon: '📋', // general
        isActive: true,
    });
    const [loading, setLoading] = useState(false);

    // Check if user has permission to manage categories
    if (!canManageCategories(user)) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="dark" />
                <View style={styles.accessDeniedContainer}>
                    <Text style={styles.accessDeniedTitle}>Access Denied</Text>
                    <Text style={styles.accessDeniedMessage}>
                        You don't have permission to manage categories.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Load categories from API
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await getCategories({ page: 1, limit: 100 });
            if (response.success && response.data.categories) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            Alert.alert('Error', 'Failed to load categories. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof CategoryForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Please enter a category name');
            return false;
        }
        if (formData.name.length < 2) {
            Alert.alert('Error', 'Category name must be at least 2 characters');
            return false;
        }
        if (formData.name.length > 30) {
            Alert.alert('Error', 'Category name must be less than 30 characters');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (editingCategory) {
                // Update existing category
                const response = await updateCategory(editingCategory._id, formData);
                if (response.success) {
                    await loadCategories(); // Reload categories from API
                    Alert.alert('Success', 'Category updated successfully!');
                    handleCloseModal();
                } else {
                    Alert.alert('Error', 'Failed to update category. Please try again.');
                }
            } else {
                // Add new category
                const response = await createCategory(formData);
                if (response.success) {
                    await loadCategories(); // Reload categories from API
                    Alert.alert('Success', 'Category added successfully!');
                    handleCloseModal();
                } else {
                    Alert.alert('Error', 'Failed to create category. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error saving category:', error);
            Alert.alert('Error', 'Failed to save category. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            color: category.color,
            icon: category.icon,
            isActive: category.isActive,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (categoryId: string) => {
        Alert.alert(
            'Delete Category',
            'Are you sure you want to delete this category?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const response = await deleteCategory(categoryId);
                            if (response.success) {
                                await loadCategories(); // Reload categories from API
                                Alert.alert('Success', 'Category deleted successfully!');
                            } else {
                                Alert.alert('Error', 'Failed to delete category. Please try again.');
                            }
                        } catch (error) {
                            console.error('Error deleting category:', error);
                            Alert.alert('Error', 'Failed to delete category. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setEditingCategory(null);
        setFormData({
            name: '',
            color: '#0000FF', // Blue
            icon: '📋', // general
            isActive: true,
        });
    };

    const renderCategory = ({ item }: { item: Category }) => (
        <View style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                    <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
                        <Text style={styles.categoryIconText}>{item.icon}</Text>
                    </View>
                    <View style={styles.categoryDetails}>
                        <Text style={styles.categoryName}>{item.name}</Text>
                        <Text style={styles.categoryColor}>Color: {item.color}</Text>
                    </View>
                </View>
                <View style={styles.categoryActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEdit(item)}
                    >
                        <Text style={styles.actionButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDelete(item._id)}
                    >
                        <Text style={styles.actionButtonText}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.categoryDate}>
                Updated: {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerTitle}>Categories</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsModalVisible(true)}
                >
                    <Text style={styles.addButtonText}>+ Add Category</Text>
                </TouchableOpacity>
            </View>

            {/* Categories List */}
            <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                style={styles.list}
            />

            {/* Add/Edit Category Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={handleCloseModal}>
                            <Text style={styles.modalCancelButton}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            {editingCategory ? 'Edit Category' : 'Add Category'}
                        </Text>
                        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                            <Text style={[styles.modalSaveButton, loading && styles.modalSaveButtonDisabled]}>
                                {loading ? 'Saving...' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Category Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => handleInputChange('name', text)}
                                placeholder="Enter category name"
                                maxLength={30}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Color</Text>
                            <View style={styles.colorPreview}>
                                <View style={[styles.colorPreviewBox, { backgroundColor: formData.color }]} />
                                <Text style={styles.colorPreviewText}>{formData.color}</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.colorContainer}>
                                    {PREDEFINED_COLORS.map((color) => (
                                        <TouchableOpacity
                                            key={color}
                                            style={[
                                                styles.colorChip,
                                                { backgroundColor: color },
                                                formData.color === color && styles.colorChipSelected
                                            ]}
                                            onPress={() => handleInputChange('color', color)}
                                        />
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Icon</Text>
                            <View style={styles.iconPreview}>
                                <Text style={styles.iconPreviewText}>{formData.icon}</Text>
                                <Text style={styles.iconPreviewLabel}>Selected Icon</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.iconContainer}>
                                    {EXPO_ICONS.map((icon) => (
                                        <TouchableOpacity
                                            key={icon}
                                            style={[
                                                styles.iconChip,
                                                formData.icon === icon && styles.iconChipSelected
                                            ]}
                                            onPress={() => handleInputChange('icon', icon)}
                                        >
                                            <Text style={styles.iconChipText}>{icon}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </ScrollView>
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
    header: {
        backgroundColor: colors.babyBlue,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 80,
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.white,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    backButtonText: {
        color: colors.babyBlue,
        fontWeight: '600',
        fontSize: 10,
        marginLeft: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
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
    list: {
        flex: 1,
    },
    listContainer: {
        padding: 20,
        paddingBottom: 90, // Add extra padding for floating bottom navigation
    },
    categoryCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryIconText: {
        fontSize: 24,
    },
    categoryDetails: {
        flex: 1,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.grayDark,
        marginBottom: 4,
    },
    categoryColor: {
        fontSize: 14,
        color: colors.gray,
    },
    categoryActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 6,
        minWidth: 36,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: colors.babyBlue,
    },
    deleteButton: {
        backgroundColor: colors.orange,
    },
    actionButtonText: {
        fontSize: 16,
    },
    categoryDate: {
        fontSize: 12,
        color: colors.gray,
        fontStyle: 'italic',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.babyBlueLight,
        backgroundColor: colors.white,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.grayDark,
    },
    modalCancelButton: {
        fontSize: 16,
        color: colors.gray,
    },
    modalSaveButton: {
        fontSize: 16,
        color: colors.orange,
        fontWeight: '600',
    },
    modalSaveButtonDisabled: {
        color: colors.gray,
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
        color: colors.grayDark,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.babyBlueLight,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: colors.white,
    },
    colorPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        padding: 12,
        backgroundColor: colors.grayLight,
        borderRadius: 8,
    },
    colorPreviewBox: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 12,
        borderWidth: 2,
        borderColor: colors.white,
    },
    colorPreviewText: {
        fontSize: 16,
        color: colors.grayDark,
        fontWeight: '500',
    },
    colorContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    colorChip: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorChipSelected: {
        borderColor: colors.orange,
        borderWidth: 3,
    },
    iconPreview: {
        alignItems: 'center',
        marginBottom: 12,
        padding: 12,
        backgroundColor: colors.grayLight,
        borderRadius: 8,
    },
    iconPreviewText: {
        fontSize: 48,
        marginBottom: 4,
    },
    iconPreviewLabel: {
        fontSize: 14,
        color: colors.gray,
    },
    iconContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    iconChip: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.grayLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    iconChipSelected: {
        borderColor: colors.orange,
        backgroundColor: colors.babyBlueLight,
    },
    iconChipText: {
        fontSize: 24,
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
