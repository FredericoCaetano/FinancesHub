import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Colors } from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreens';
import CategoriesScreen from '../screens/CategoriesScreen';
import FixedExpensesScreen from '../screens/FixedExpensesScreen';
import ReportsScreen from '../screens/ReportsScreens';
const Tab = createMaterialTopTabNavigator();
const TAB_ICON_SIZE = 20;

export default function AppTabs() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={{
        lazy: false,
        swipeEnabled: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          width: '100%',
          textTransform: 'none',
        },
        tabBarShowIcon: true,
        tabBarIndicatorStyle: { height: 0 },
        tabBarItemStyle: { alignItems: 'center', justifyContent: 'flex-start' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialDesignIcons
              name="view-dashboard-outline"
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Transações"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialDesignIcons
              name="bank-transfer"
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Categorias"
        component={CategoriesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialDesignIcons
              name="tag-multiple-outline"
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Gastos Fixos"
        component={FixedExpensesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialDesignIcons
              name="rotate-3d-variant"
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Relatórios"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialDesignIcons
              name="chart-bar"
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
