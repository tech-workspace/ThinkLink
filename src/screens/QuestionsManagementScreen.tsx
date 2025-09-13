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
import { colors } from '../theme/colors';
import { getQuestions, getQuestionCategories, createQuestion, updateQuestion, deleteQuestion, Question } from '../services/questionService';
import { getCategories, Category } from '../services/categoryService';

// Question interface is now imported from questionService

interface QuestionForm {
    title: string;
    answer: string;
    category: string;
    level: 'Easy' | 'Medium' | 'Hard';
}

const LEVELS = [
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' },
];

export default function QuestionsManagementScreen() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [formData, setFormData] = useState<QuestionForm>({
        title: '',
        answer: '',
        category: '',
        level: 'Easy',
    });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryDetails, setCategoryDetails] = useState<Category[]>([]);
    const [searchTitle, setSearchTitle] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    // Load questions and categories from API
    useEffect(() => {
        loadQuestions();
        loadCategories();
    }, []);

    // Filter questions when search criteria change
    useEffect(() => {
        filterQuestions();
    }, [questions, searchTitle, searchCategory]);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const response = await getQuestions({ page: 1, limit: 100 });
            if (response.success && response.data.questions) {
                setQuestions(response.data.questions);
                setFilteredQuestions(response.data.questions);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            Alert.alert('Error', 'Failed to load questions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterQuestions = () => {
        let filtered = questions;

        if (searchTitle.trim()) {
            filtered = filtered.filter(question =>
                question.title.toLowerCase().includes(searchTitle.toLowerCase())
            );
        }

        if (searchCategory.trim()) {
            filtered = filtered.filter(question =>
                question.category.toLowerCase().includes(searchCategory.toLowerCase())
            );
        }

        setFilteredQuestions(filtered);
    };

    const loadCategories = async () => {
        try {
            const categoriesData = await getQuestionCategories();
            setCategories(categoriesData);

            // Also load full category details for colors and icons
            try {
                const response = await getCategories({ isActive: true, limit: 100 });
                if (response.success && response.data.categories) {
                    setCategoryDetails(response.data.categories);
                } else {
                    console.warn('Categories API returned unsuccessful response');
                    setCategoryDetails([]);
                }
            } catch (categoryError) {
                console.warn('Error loading category details, continuing without colors/icons:', categoryError);
                setCategoryDetails([]);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            // Fallback to default categories
            setCategories(['JavaScript', 'Python', 'React', 'Database', 'Other']);
            setCategoryDetails([]);
        }
    };

    const handleInputChange = (field: keyof QuestionForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter a question title');
            return false;
        }
        if (!formData.answer.trim()) {
            Alert.alert('Error', 'Please enter an answer');
            return false;
        }
        if (!formData.category.trim()) {
            Alert.alert('Error', 'Please select a category');
            return false;
        }
        if (!formData.level.trim()) {
            Alert.alert('Error', 'Please select a difficulty level');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (editingQuestion) {
                // Update existing question
                const response = await updateQuestion(editingQuestion._id, formData);
                if (response.success) {
                    await loadQuestions(); // Reload questions from API
                    Alert.alert('Success', 'Question updated successfully!');
                    handleCloseModal();
                } else {
                    Alert.alert('Error', 'Failed to update question. Please try again.');
                }
            } else {
                // Add new question
                const response = await createQuestion(formData);
                if (response.success) {
                    await loadQuestions(); // Reload questions from API
                    Alert.alert('Success', 'Question added successfully!');
                    handleCloseModal();
                } else {
                    Alert.alert('Error', 'Failed to create question. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error saving question:', error);
            Alert.alert('Error', 'Failed to save question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (question: Question) => {
        setEditingQuestion(question);
        setFormData({
            title: question.title,
            answer: question.answer,
            category: question.category,
            level: question.level,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (questionId: string) => {
        Alert.alert(
            'Delete Question',
            'Are you sure you want to delete this question?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const response = await deleteQuestion(questionId);
                            if (response.success) {
                                await loadQuestions(); // Reload questions from API
                                Alert.alert('Success', 'Question deleted successfully!');
                            } else {
                                Alert.alert('Error', 'Failed to delete question. Please try again.');
                            }
                        } catch (error) {
                            console.error('Error deleting question:', error);
                            Alert.alert('Error', 'Failed to delete question. Please try again.');
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
        setEditingQuestion(null);
        setFormData({
            title: '',
            answer: '',
            category: '',
            level: 'Easy',
        });
    };

    const getLevelLabel = (level: string) => {
        return LEVELS.find(l => l.value === level)?.label || level;
    };

    const getCategoryDetails = (categoryName: string) => {
        return categoryDetails.find(cat => cat.name === categoryName) || null;
    };

    const renderQuestion = ({ item }: { item: Question }) => {
        const categoryInfo = getCategoryDetails(item.category);

        return (
            <View style={styles.questionCard}>
                <View style={styles.questionHeader}>
                    <Text style={styles.questionTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View style={styles.questionActions}>
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

                <View style={styles.questionMeta}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Category:</Text>
                        <View style={styles.categoryDisplay}>
                            {categoryInfo ? (
                                <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color }]}>
                                    <Text style={styles.categoryIconText}>{categoryInfo.icon}</Text>
                                </View>
                            ) : (
                                <View style={[styles.categoryIcon, { backgroundColor: colors.gray }]}>
                                    <Text style={styles.categoryIconText}>📋</Text>
                                </View>
                            )}
                            <Text style={styles.metaValue}>{item.category}</Text>
                        </View>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Level:</Text>
                        <Text style={[styles.metaValue, styles.levelBadge]}>
                            {getLevelLabel(item.level)}
                        </Text>
                    </View>
                </View>

                <Text style={styles.questionAnswer} numberOfLines={3}>
                    {item.answer}
                </Text>

                <Text style={styles.questionDate}>
                    Updated: {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Questions</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsModalVisible(true)}
                >
                    <Text style={styles.addButtonText}>+ Add Question</Text>
                </TouchableOpacity>
            </View>

            {/* Search Section */}
            <View style={styles.searchSection}>
                <View style={styles.searchInputContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by title..."
                        value={searchTitle}
                        onChangeText={setSearchTitle}
                        placeholderTextColor={colors.gray}
                    />
                </View>
                <View style={styles.searchInputContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by category..."
                        value={searchCategory}
                        onChangeText={setSearchCategory}
                        placeholderTextColor={colors.gray}
                    />
                </View>
            </View>

            {/* Questions List */}
            <FlatList
                data={filteredQuestions}
                renderItem={renderQuestion}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                style={styles.list}
            />

            {/* Add/Edit Question Modal */}
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
                            {editingQuestion ? 'Edit Question' : 'Add Question'}
                        </Text>
                        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                            <Text style={[styles.modalSaveButton, loading && styles.modalSaveButtonDisabled]}>
                                {loading ? 'Saving...' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Question Title *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.title}
                                onChangeText={(text) => handleInputChange('title', text)}
                                placeholder="Enter the question title"
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Answer *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.answer}
                                onChangeText={(text) => handleInputChange('answer', text)}
                                placeholder="Enter the answer"
                                multiline
                                numberOfLines={6}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Category *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.categoryContainer}>
                                    {categories.map((category) => (
                                        <TouchableOpacity
                                            key={category}
                                            style={[
                                                styles.categoryChip,
                                                formData.category === category && styles.categoryChipSelected
                                            ]}
                                            onPress={() => handleInputChange('category', category)}
                                        >
                                            <Text style={[
                                                styles.categoryChipText,
                                                formData.category === category && styles.categoryChipTextSelected
                                            ]}>
                                                {category}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Difficulty Level *</Text>
                            <View style={styles.levelContainer}>
                                {LEVELS.map((level) => (
                                    <TouchableOpacity
                                        key={level.value}
                                        style={[
                                            styles.levelChip,
                                            formData.level === level.value && styles.levelChipSelected
                                        ]}
                                        onPress={() => handleInputChange('level', level.value)}
                                    >
                                        <Text style={[
                                            styles.levelChipText,
                                            formData.level === level.value && styles.levelChipTextSelected
                                        ]}>
                                            {level.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
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
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
    },
    addButton: {
        backgroundColor: colors.orange,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    searchSection: {
        backgroundColor: colors.white,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },
    searchInputContainer: {
        marginBottom: 10,
    },
    searchInput: {
        backgroundColor: colors.grayLight,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.grayDark,
        borderWidth: 1,
        borderColor: colors.grayLight,
    },
    list: {
        flex: 1,
    },
    listContainer: {
        padding: 20,
        paddingBottom: 90, // Add extra padding for floating bottom navigation
    },
    questionCard: {
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
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    questionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.grayDark,
        flex: 1,
        marginRight: 12,
    },
    questionActions: {
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
        backgroundColor: colors.green,
    },
    deleteButton: {
        backgroundColor: colors.red,
    },
    actionButtonText: {
        fontSize: 16,
    },
    questionMeta: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryIconText: {
        fontSize: 12,
        color: colors.white,
    },
    metaLabel: {
        fontSize: 14,
        color: colors.gray,
        marginRight: 4,
    },
    metaValue: {
        fontSize: 14,
        color: colors.grayDark,
        fontWeight: '500',
    },
    levelBadge: {
        backgroundColor: colors.babyBlueLight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    questionAnswer: {
        fontSize: 14,
        color: colors.gray,
        lineHeight: 20,
        marginBottom: 8,
    },
    questionDate: {
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
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        backgroundColor: colors.grayLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.babyBlueLight,
    },
    categoryChipSelected: {
        backgroundColor: colors.babyBlue,
        borderColor: colors.babyBlue,
    },
    categoryChipText: {
        fontSize: 14,
        color: colors.gray,
    },
    categoryChipTextSelected: {
        color: colors.white,
        fontWeight: '600',
    },
    levelContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    levelChip: {
        backgroundColor: colors.grayLight,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.babyBlueLight,
    },
    levelChipSelected: {
        backgroundColor: colors.orange,
        borderColor: colors.orange,
    },
    levelChipText: {
        fontSize: 14,
        color: colors.gray,
        fontWeight: '500',
    },
    levelChipTextSelected: {
        color: colors.white,
        fontWeight: '600',
    },
});
