import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { getQuestionStats } from '../services/questionService';
import { getCategoriesWithCounts } from '../services/categoryService';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation?: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [questionStats, categoryStats] = await Promise.all([
        getQuestionStats(),
        getCategoriesWithCounts()
      ]);

      setStats({
        totalQuestions: questionStats.totalQuestions,
        totalCategories: categoryStats.length,
      });
    } catch (error) {
      // Fallback to default values
      setStats({
        totalQuestions: 0,
        totalCategories: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.userName}>{user?.fullName}</Text>
            </View>
            <View style={styles.avatar}>
              <Image
                source={require('../../assets/ThinkLink.png')}
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {loading ? '...' : stats.totalQuestions}
            </Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {loading ? '...' : stats.totalCategories}
            </Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.gameCard}>
            <View style={styles.gameHeader}>
              <Image
                source={require('../../assets/ThinkLink.png')}
                style={styles.gameIcon}
                resizeMode="contain"
              />
              <Text style={styles.gameTitle}>Start Game</Text>
            </View>
            <Text style={styles.gameDescription}>
              Test your knowledge with our interactive question game. Search by title, category, or difficulty level.
            </Text>
            <TouchableOpacity
              style={styles.startGameButton}
              onPress={() => navigation?.navigate('Game')}
            >
              <Text style={styles.startGameButtonText}>🎯 Start Game</Text>
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
    paddingBottom: 90, // Add extra padding for floating bottom navigation
  },
  header: {
    backgroundColor: colors.babyBlue,
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  userName: {
    fontSize: 18,
    color: colors.white,
    opacity: 0.9,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 30,
    justifyContent: 'center',
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 10,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.orange,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
  },
  gameCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.grayDark,
  },
  gameDescription: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  startGameButton: {
    backgroundColor: colors.orange,
    borderRadius: 15,
    paddingHorizontal: 30,
    paddingVertical: 16,
    shadowColor: colors.orange,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startGameButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
