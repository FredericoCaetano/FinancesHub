import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Colors } from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreens';
import CategoriesScreen from '../screens/CategoriesScreen';
import FixedExpensesScreen from '../screens/FixedExpensesScreen';
import ReportsScreen from '../screens/ReportsScreens';
import { PlatformPressable } from '@react-navigation/elements';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        lazy: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, marginBottom: 6 },
        tabBarButton: props => (
          <PlatformPressable
            {...props}
            android_ripple={{ color: 'rgba(0,0,0,0.10)', radius: 40 }}
            pressOpacity={0.85} // iOS
          />
        ),
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialDesignIcons
              name="view-dashboard-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Transacoes"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialDesignIcons
              name="bank-transfer"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Categorias"
        component={CategoriesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialDesignIcons
              name="tag-multiple-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="GastosFixos"
        component={FixedExpensesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialDesignIcons
              name="rotate-3d-variant"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Relatorios"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialDesignIcons name="chart-bar" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
