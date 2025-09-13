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
    TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { getQuestions, getQuestionCategories, getQuestionLevels, Question, QuestionSearchParams } from '../services/questionService';
import { getCategories, Category } from '../services/categoryService';
import { useAuth } from '../contexts/AuthContext';

// Question interface is now imported from questionService

interface SearchFilters {
    title: string;
    category: string;
    level: string;
    pageSize: string;
}

// LEVELS array removed - now using API data from levels state

const PAGE_SIZES = [
    { value: '1', label: '1' },
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '20', label: '20' },
];

export default function GameScreen() {
    const { isAuthenticated } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        title: '',
        category: 'All Categories',
        level: 'All',
        pageSize: '1',
    });
    const [loading, setLoading] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryDetails, setCategoryDetails] = useState<Category[]>([]);
    const [levels, setLevels] = useState<string[]>([]);
    const [showLevelDropdown, setShowLevelDropdown] = useState(false);
    const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Load categories and levels from API
    const loadData = async () => {
        try {
            const [categoriesData, levelsData] = await Promise.all([
                getQuestionCategories(),
                getQuestionLevels()
            ]);

            // Ensure we have valid arrays
            const validCategories = Array.isArray(categoriesData) ? categoriesData : [];
            const validLevels = Array.isArray(levelsData) ? levelsData : [];


            setCategories(['All Categories', ...validCategories]);
            setLevels(['All', ...validLevels]);

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
            console.error('Error loading categories and levels:', error);
            // Fallback to default values
            setCategories(['All Categories', 'JavaScript', 'Python', 'React', 'Database']);
            setLevels(['All', 'Easy', 'Medium', 'Hard']);
            setCategoryDetails([]);
        }
    };

    // Load data when component mounts
    useEffect(() => {
        loadData();
    }, []);

    // Reload data when screen comes into focus (e.g., when returning from admin panel)
    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );

    const handleFilterChange = (field: keyof SearchFilters, value: string) => {
        setSearchFilters(prev => ({
            ...prev,
            [field]: value,
        }));
    };


    const fetchAllQuestions = async (baseParams: QuestionSearchParams) => {
        const allQuestions: Question[] = [];
        let currentPage = 1;
        let hasMore = true;

        while (hasMore) {
            const params = { ...baseParams, page: currentPage, limit: 100 };

            const response = await getQuestions(params);

            if (response.success && response.data.questions) {
                allQuestions.push(...response.data.questions);
                hasMore = response.data.pagination.hasNext;
                currentPage++;

            } else {
                hasMore = false;
            }
        }

        return allQuestions;
    };

    const handleSearch = async () => {
        if (!isAuthenticated) {
            Alert.alert('Authentication Required', 'Please log in to search questions.');
            return;
        }

        setLoading(true);
        try {

            // Prepare API search parameters
            const searchParams: QuestionSearchParams = {};

            if (searchFilters.title && searchFilters.title.trim()) {
                searchParams.search = searchFilters.title.trim();
            }

            if (searchFilters.category && searchFilters.category !== 'All Categories') {
                searchParams.category = searchFilters.category;
            }

            if (searchFilters.level && searchFilters.level !== 'All') {
                searchParams.level = searchFilters.level;
            }

            // Call API to get ALL questions across multiple pages

            const allQuestions = await fetchAllQuestions(searchParams);

            if (allQuestions.length > 0) {
                const questionsPerPage = parseInt(searchFilters.pageSize);
                const totalQuestions = allQuestions.length;
                const totalPages = Math.ceil(totalQuestions / questionsPerPage);


                setFilteredQuestions(allQuestions);
                setCurrentQuestionIndex(0);
                setCurrentPage(1);
                setTotalPages(totalPages);
                setGameStarted(true);

            } else {
                Alert.alert('No Results', 'No questions found matching your criteria. Try adjusting your search filters.');
            }
        } catch (error: any) {
            console.error('Search error:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });
            Alert.alert('Error', `Failed to search questions: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);

            // Update question index to first question of new page
            const questionsPerPage = parseInt(searchFilters.pageSize);
            const newIndex = (newPage - 1) * questionsPerPage;
            setCurrentQuestionIndex(newIndex);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);

            // Update question index to first question of new page
            const questionsPerPage = parseInt(searchFilters.pageSize);
            const newIndex = (newPage - 1) * questionsPerPage;
            setCurrentQuestionIndex(newIndex);
        }
    };

    const handleNewSearch = () => {
        setGameStarted(false);
        setFilteredQuestions([]);
        setCurrentQuestionIndex(0);
        setCurrentPage(1);
        setTotalPages(1);
        setSearchFilters({
            title: '',
            category: 'All Categories',
            level: 'All',
            pageSize: '1',
        });
    };

    const getLevelLabel = (level: string) => {
        return level; // API returns the actual level names
    };

    const getCategoryDetails = (categoryName: string) => {
        return categoryDetails.find(cat => cat.name === categoryName) || null;
    };

    // Get questions for current page based on pageSize
    const getCurrentPageQuestions = () => {
        const questionsPerPage = parseInt(searchFilters.pageSize);
        const startIndex = (currentPage - 1) * questionsPerPage;
        const endIndex = startIndex + questionsPerPage;
        return filteredQuestions.slice(startIndex, endIndex);
    };

    // Get current question within the page
    const getCurrentQuestionInPage = () => {
        const pageQuestions = getCurrentPageQuestions();
        const questionIndexInPage = currentQuestionIndex % parseInt(searchFilters.pageSize);
        return pageQuestions[questionIndexInPage] || pageQuestions[0];
    };

    const currentQuestion = filteredQuestions[currentQuestionIndex];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Search Questions</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Search Form */}
                <TouchableWithoutFeedback onPress={() => {
                    setShowLevelDropdown(false);
                    setShowPageSizeDropdown(false);
                }}>
                    <View style={styles.searchForm}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Search by Title</Text>
                            <TextInput
                                style={styles.input}
                                value={searchFilters.title}
                                onChangeText={(text) => handleFilterChange('title', text)}
                                placeholder="Enter question title keywords"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.chipContainer}>
                                    {categories.map((category) => (
                                        <TouchableOpacity
                                            key={category}
                                            style={[
                                                styles.chip,
                                                searchFilters.category === category && styles.chipSelected
                                            ]}
                                            onPress={() => handleFilterChange('category', category)}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                searchFilters.category === category && styles.chipTextSelected
                                            ]}>
                                                {category}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        <View style={styles.inlineContainer}>
                            <View style={styles.inlineDropdownContainer}>
                                <Text style={styles.inlineLabel}>Level</Text>
                                <TouchableOpacity
                                    style={styles.inlineDropdownButton}
                                    onPress={() => {
                                        setShowPageSizeDropdown(false);
                                        setShowLevelDropdown(!showLevelDropdown);
                                    }}
                                >
                                    <Text style={styles.inlineDropdownText}>{searchFilters.level}</Text>
                                    <Text style={styles.inlineDropdownArrow}>{showLevelDropdown ? '▲' : '▼'}</Text>
                                </TouchableOpacity>

                                {showLevelDropdown && (
                                    <View style={styles.inlineDropdownList}>
                                        {levels.map((level) => (
                                            <TouchableOpacity
                                                key={level}
                                                style={[
                                                    styles.inlineDropdownItem,
                                                    searchFilters.level === level && styles.inlineDropdownItemSelected
                                                ]}
                                                onPress={() => {
                                                    handleFilterChange('level', level);
                                                    setShowLevelDropdown(false);
                                                }}
                                            >
                                                <Text style={[
                                                    styles.inlineDropdownItemText,
                                                    searchFilters.level === level && styles.inlineDropdownItemTextSelected
                                                ]}>
                                                    {level}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={styles.inlineDropdownContainer}>
                                <Text style={styles.inlineLabel}>Per Page</Text>
                                <TouchableOpacity
                                    style={styles.inlineDropdownButton}
                                    onPress={() => {
                                        setShowLevelDropdown(false);
                                        setShowPageSizeDropdown(!showPageSizeDropdown);
                                    }}
                                >
                                    <Text style={styles.inlineDropdownText}>
                                        {PAGE_SIZES.find(size => size.value === searchFilters.pageSize)?.label}
                                    </Text>
                                    <Text style={styles.inlineDropdownArrow}>{showPageSizeDropdown ? '▲' : '▼'}</Text>
                                </TouchableOpacity>

                                {showPageSizeDropdown && (
                                    <View style={styles.inlineDropdownList}>
                                        {PAGE_SIZES.map((size) => (
                                            <TouchableOpacity
                                                key={size.value}
                                                style={[
                                                    styles.inlineDropdownItem,
                                                    searchFilters.pageSize === size.value && styles.inlineDropdownItemSelected
                                                ]}
                                                onPress={() => {
                                                    handleFilterChange('pageSize', size.value);
                                                    setShowPageSizeDropdown(false);
                                                }}
                                            >
                                                <Text style={[
                                                    styles.inlineDropdownItemText,
                                                    searchFilters.pageSize === size.value && styles.inlineDropdownItemTextSelected
                                                ]}>
                                                    {size.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={styles.searchButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.inlineSearchButton, loading && styles.inlineSearchButtonDisabled]}
                                    onPress={handleSearch}
                                    disabled={loading}
                                >
                                    <Text style={[styles.inlineSearchButtonText, loading && styles.inlineSearchButtonTextDisabled]}>
                                        {loading ? 'Searching...' : '🔍 Search'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>

                {/* Results Section */}
                {gameStarted && filteredQuestions.length > 0 && (
                    <View style={styles.resultsSection}>
                        <View style={styles.resultsHeader}>
                            <Text style={styles.resultsTitle}>
                                Page {currentPage} of {totalPages}
                            </Text>
                            <TouchableOpacity
                                style={styles.newSearchButton}
                                onPress={handleNewSearch}
                            >
                                <Text style={styles.newSearchButtonText}>Reset Search</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Questions List for Current Page */}
                        {getCurrentPageQuestions().map((question, index) => {
                            const categoryInfo = getCategoryDetails(question.category);

                            return (
                                <View key={question._id} style={styles.questionCard}>
                                    <View style={styles.questionHeader}>
                                        <Text style={styles.questionTitle}>
                                            {question.title}
                                        </Text>
                                        <Text style={styles.questionNumber}>
                                            #{((currentPage - 1) * parseInt(searchFilters.pageSize)) + index + 1}
                                        </Text>
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
                                                <Text style={styles.metaValue}>{question.category}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.metaItem}>
                                            <Text style={styles.metaLabel}>Level:</Text>
                                            <Text style={[styles.metaValue, styles.levelBadge]}>
                                                {getLevelLabel(question.level)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.answerContainer}>
                                        <Text style={styles.answerLabel}>Answer:</Text>
                                        <Text style={styles.answerText}>{question.answer}</Text>
                                    </View>
                                </View>
                            );
                        })}

                        {/* Unified Navigation */}
                        <View style={styles.unifiedNavigationContainer}>
                            {/* Page Info */}
                            {totalPages > 1 && (
                                <View style={styles.pageInfoRow}>
                                    <Text style={styles.pageInfoText}>
                                        Page {currentPage} of {totalPages} • {parseInt(searchFilters.pageSize)} per page
                                    </Text>
                                </View>
                            )}

                            {/* Navigation Buttons */}
                            <View style={styles.navigationRow}>
                                <TouchableOpacity
                                    style={[styles.navButton, styles.previousButton, currentPage === 1 && styles.navButtonDisabled]}
                                    onPress={handlePrevious}
                                    disabled={currentPage === 1}
                                >
                                    <Text style={[styles.navButtonText, currentPage === 1 && styles.navButtonTextDisabled]}>
                                        ← Previous
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.questionCounter}>
                                    <Text style={styles.questionCounterText}>
                                        {currentPage} / {totalPages}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={[styles.navButton, styles.nextButton, currentPage === totalPages && styles.navButtonDisabled]}
                                    onPress={handleNext}
                                    disabled={currentPage === totalPages}
                                >
                                    <Text style={[styles.navButtonText, currentPage === totalPages && styles.navButtonTextDisabled]}>
                                        Next →
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>
                )}

                {/* No Results */}
                {gameStarted && filteredQuestions.length === 0 && (
                    <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>No questions found with the selected criteria.</Text>
                        <TouchableOpacity
                            style={styles.newSearchButton}
                            onPress={handleNewSearch}
                        >
                            <Text style={styles.newSearchButtonText}>🔍 Try New Search</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
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
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    searchButton: {
        backgroundColor: colors.orange,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    searchButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    searchButtonDisabled: {
        opacity: 0.6,
    },
    newSearchButton: {
        backgroundColor: colors.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    newSearchButtonText: {
        color: colors.babyBlue,
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        flex: 1,
        paddingBottom: 150, // Increased padding to ensure navigation buttons are fully visible
    },
    searchForm: {
        padding: 20,
        backgroundColor: colors.white,
        margin: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2, // Higher than results but lower than dropdowns
        zIndex: 2, // Higher than results but lower than dropdowns
    },
    searchContent: {
        flex: 1,
        padding: 20,
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.grayDark,
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.babyBlueLight,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: colors.white,
    },
    dropdownButton: {
        borderWidth: 1,
        borderColor: colors.babyBlueLight,
        borderRadius: 8,
        padding: 12,
        backgroundColor: colors.white,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownButtonText: {
        fontSize: 16,
        color: colors.grayDark,
    },
    dropdownArrow: {
        fontSize: 12,
        color: colors.gray,
    },
    dropdownList: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.babyBlueLight,
        borderRadius: 8,
        maxHeight: 200,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },
    dropdownItemSelected: {
        backgroundColor: colors.babyBlueLight,
    },
    dropdownItemText: {
        fontSize: 16,
        color: colors.grayDark,
    },
    dropdownItemTextSelected: {
        color: colors.babyBlue,
        fontWeight: '600',
    },
    inlineContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
        alignItems: 'flex-end',
    },
    inlineDropdownContainer: {
        flex: 1,
        position: 'relative',
    },
    inlineLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.grayDark,
        marginBottom: 8,
    },
    inlineDropdownButton: {
        borderWidth: 1,
        borderColor: colors.babyBlueLight,
        borderRadius: 8,
        padding: 10,
        backgroundColor: colors.white,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 44,
    },
    inlineDropdownText: {
        fontSize: 14,
        color: colors.grayDark,
        flex: 1,
    },
    inlineDropdownArrow: {
        fontSize: 10,
        color: colors.gray,
        marginLeft: 8,
    },
    inlineDropdownList: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.babyBlueLight,
        borderRadius: 8,
        maxHeight: 150,
        zIndex: 99999,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    inlineDropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },
    inlineDropdownItemSelected: {
        backgroundColor: colors.babyBlueLight,
    },
    inlineDropdownItemText: {
        fontSize: 14,
        color: colors.grayDark,
    },
    inlineDropdownItemTextSelected: {
        color: colors.babyBlue,
        fontWeight: '600',
    },
    searchButtonContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    inlineSearchButton: {
        backgroundColor: colors.orange,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    inlineSearchButtonDisabled: {
        backgroundColor: colors.gray,
        opacity: 0.6,
    },
    inlineSearchButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    inlineSearchButtonTextDisabled: {
        color: colors.gray,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        backgroundColor: colors.grayLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.babyBlueLight,
    },
    chipSelected: {
        backgroundColor: colors.babyBlue,
        borderColor: colors.babyBlue,
    },
    chipText: {
        fontSize: 14,
        color: colors.gray,
    },
    chipTextSelected: {
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
    pageSizeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pageSizeChip: {
        backgroundColor: colors.grayLight,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.babyBlueLight,
    },
    pageSizeChipSelected: {
        backgroundColor: colors.orange,
        borderColor: colors.orange,
    },
    pageSizeChipText: {
        fontSize: 14,
        color: colors.gray,
        fontWeight: '500',
    },
    pageSizeChipTextSelected: {
        color: colors.white,
        fontWeight: '600',
    },
    questionContainer: {
        flex: 1,
        padding: 20,
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
        marginRight: 8,
    },
    questionNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.babyBlue,
        backgroundColor: colors.babyBlueLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    questionMeta: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 12,
        justifyContent: 'space-between',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 0,
        maxWidth: '48%',
    },
    categoryDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.grayLight,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 4,
        maxWidth: '100%',
    },
    categoryIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    categoryIconText: {
        fontSize: 12,
        color: colors.white,
        fontWeight: 'bold',
    },
    metaLabel: {
        fontSize: 14,
        color: colors.gray,
        marginRight: 4,
    },
    metaValue: {
        fontSize: 12,
        color: colors.grayDark,
        fontWeight: '600',
        flexShrink: 1,
    },
    levelBadge: {
        backgroundColor: colors.babyBlueLight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    answerContainer: {
        backgroundColor: colors.grayLight,
        borderRadius: 12,
        padding: 16,
    },
    answerLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.grayDark,
        marginBottom: 8,
    },
    answerText: {
        fontSize: 16,
        color: colors.gray,
        lineHeight: 24,
    },
    navigationContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    navButton: {
        flex: 1,
        maxWidth: 120,
        backgroundColor: colors.orange,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navButtonDisabled: {
        backgroundColor: colors.gray,
    },
    previousButton: {
        backgroundColor: colors.babyBlue,
    },
    nextButton: {
        backgroundColor: colors.orange,
    },
    resultsSection: {
        padding: 20,
        paddingBottom: 50, // Increased padding at bottom for navigation buttons
        backgroundColor: colors.white,
        margin: 10,
        marginBottom: 30, // Increased margin at bottom
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1, // Lower elevation than dropdowns
        zIndex: 1, // Lower z-index than dropdowns
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.grayDark,
    },
    noResultsContainer: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: colors.white,
        margin: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    noResultsText: {
        fontSize: 16,
        color: colors.gray,
        textAlign: 'center',
        marginBottom: 20,
    },
    unifiedNavigationContainer: {
        marginTop: 20,
        paddingTop: 20,
        paddingBottom: 20, // Added bottom padding to navigation container
        borderTopWidth: 1,
        borderTopColor: colors.grayLight,
    },
    pageInfoRow: {
        alignItems: 'center',
        marginBottom: 15,
    },
    pageInfoText: {
        fontSize: 14,
        color: colors.gray,
        fontWeight: '500',
    },
    navigationRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: 10,
    },
    questionCounter: {
        backgroundColor: colors.babyBlueLight,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        width: 80,
        alignItems: 'center',
        flexShrink: 0,
    },
    questionCounterText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.babyBlue,
    },
    navButtonText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    navButtonTextDisabled: {
        color: colors.gray,
        opacity: 0.6,
    },
});
