import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QuestionsManagementScreen from '../screens/QuestionsManagementScreen';
import CategoriesManagementScreen from '../screens/CategoriesManagementScreen';
import UsersManagementScreen from '../screens/UsersManagementScreen';
import RolesManagementScreen from '../screens/RolesManagementScreen';
import GameScreen from '../screens/GameScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AdminStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
            <Stack.Screen name="QuestionsManagement" component={QuestionsManagementScreen} />
            <Stack.Screen name="CategoriesManagement" component={CategoriesManagementScreen} />
            <Stack.Screen name="UsersManagement" component={UsersManagementScreen} />
            <Stack.Screen name="RolesManagement" component={RolesManagementScreen} />
        </Stack.Navigator>
    );
}

function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
        </Stack.Navigator>
    );
}

export default function MainNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopWidth: 1,
                    borderTopColor: colors.babyBlueLight,
                    paddingBottom: 15,
                    paddingTop: 5,
                    height: 70,
                    position: 'absolute',
                    bottom: 0,
                    left: 10,
                    right: 10,
                    borderRadius: 0,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                },
                tabBarActiveTintColor: colors.orange,
                tabBarInactiveTintColor: colors.gray,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>🏠</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Admin"
                component={AdminStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>⚙️</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>👤</Text>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
