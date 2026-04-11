import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextStyle,
} from 'react-native';
import { Colors } from '../theme';
import LinearGradient from 'react-native-linear-gradient';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { use, useCallback, useEffect, useState } from 'react';
import { listTransactions, Transaction } from '../services/transactionService';
import { Shadow } from 'react-native-shadow-2';
import { BarChart } from 'react-native-gifted-charts/dist/BarChart';
import { useFocusEffect } from '@react-navigation/native';

//==================================================================================
// Types
//==================================================================================
type DayBucket = {
  label: string;
  income: number;
  expense: number;
};

//==================================================================================
// Constants
//==================================================================================
const formatDayLabel = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}`;

//==================================================================================
// Main Component
//==================================================================================
function DashboardScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlySummary, setMonthlySummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [monthlyTransactions, setMonthlyTransactions] = useState<Transaction[]>(
    [],
  );
  const [monthlyAvarageExpenses, setMonthlyAvarageExpenses] = useState(0);

  //==================================================================================
  // Effects
  //==================================================================================

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const list = await listTransactions();
        setTransactions(list);
      };
      load();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const filteredMonthly = transactions.filter(t => {
        const date = new Date(t.date);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      });

      const income = filteredMonthly
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.value, 0);

      const expenses = filteredMonthly
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.value, 0);

      setMonthlySummary({
        balance: income - expenses,
        income,
        expenses,
      });

      setMonthlyTransactions(filteredMonthly);
      calculateMonthlyAvarageExpenses(filteredMonthly);
    }, [transactions]),
  );

  //==================================================================================
  // Functions
  //==================================================================================
  const capitalize = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  const catchDate = () => {
    const today = new Date();
    const text = today.toLocaleString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
    return capitalize(text);
  };

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const calculateMonthlyAvarageExpenses = (list: Transaction[]) => {
    const expenses = list.filter(t => t.type === 'expense');
    if (expenses.length === 0) {
      setMonthlyAvarageExpenses(0);
      return;
    }
    const totalExpenses = expenses.reduce((sum, t) => sum + t.value, 0);
    setMonthlyAvarageExpenses(totalExpenses / expenses.length);
  };

  const buildLastSevenDays = (transactions: Transaction[]): DayBucket[] => {
    const today = new Date();
    const lastSevenDays: DayBucket[] = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i,
      );
      const dayStart = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
      );
      const dayEnd = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate() + 1,
      );

      let income = 0;
      let expense = 0;
      for (const t of transactions) {
        const txDate = new Date(t.date);
        if (txDate >= dayStart && txDate < dayEnd) {
          if (t.type === 'income') income += t.value;
          if (t.type === 'expense') expense += t.value;
        }
      }

      lastSevenDays.push({
        label: formatDayLabel(day),
        income,
        expense,
      });
    }

    return lastSevenDays;
  };

  const last7 = buildLastSevenDays(transactions);
  const step = Math.ceil(last7.length / 4);
  const BAR_WIDTH = 10;
  const INNER_GAP = 2;
  const GROUP_GAP = 12;
  const GROUP_LABEL_WIDTH = BAR_WIDTH * 2 + GROUP_GAP;
  const chartLabelTextStyle: TextStyle = {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.textSecondary,
  };
  const axisLabelTextStyle: TextStyle = {
    fontSize: 10,
    color: Colors.textSecondary,
  };
  const chartData = last7.flatMap((day, dayIndex) => {
    const showLabel = dayIndex % step === 0 || dayIndex === last7.length - 1;

    return [
      {
        value: day.income,
        frontColor: Colors.success,
        spacing: INNER_GAP,
        label: showLabel ? day.label : '',
        labelWidth: GROUP_LABEL_WIDTH,
        labelTextStyle: chartLabelTextStyle,
      },
      {
        value: day.expense,
        frontColor: Colors.error,
        spacing: GROUP_GAP,
        label: '',
      },
    ];
  });

  const maxValue =
    Math.max(1, ...last7.flatMap(d => [d.income, d.expense])) * 1.2;

  //==================================================================================
  //  Renders
  //==================================================================================

  const renderMonthlyTransactions = () => {
    const sorted = [...monthlyTransactions].sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return bTime - aTime;
    });
    const latest = sorted.slice(0, 5);
    return (
      <View style={{ width: '100%', flexDirection: 'column', gap: 12 }}>
        {latest.map(transaction => (
          <View
            key={transaction.id}
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  marginRight: 8,
                  padding: 6,
                  borderRadius: 100,
                  backgroundColor:
                    transaction.type === 'income'
                      ? Colors.successBackground
                      : Colors.errorBackground,
                }}
              >
                <MaterialDesignIcons
                  name={
                    transaction.type === 'income'
                      ? 'arrow-up-bold-circle-outline'
                      : 'arrow-down-bold-circle-outline'
                  }
                  size={16}
                  color={
                    transaction.type === 'income'
                      ? Colors.success
                      : Colors.error
                  }
                />
              </View>
              <View style={{ flexDirection: 'column' }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: Colors.textPrimary,
                    fontWeight: '600',
                  }}
                >
                  {transaction.description}
                </Text>
                <Text style={{ fontSize: 12, color: Colors.textPrimary }}>
                  {transaction.categoryName}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color:
                    transaction.type === 'income'
                      ? Colors.success
                      : Colors.error,
                }}
              >
                {transaction.type === 'income' ? '+' : '-'} R${' '}
                {formatMoney(transaction.value)}
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textPrimary }}>
                {new Date(transaction.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                })}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  //==================================================================================
  // Main Render
  //==================================================================================
  return (
    <LinearGradient
      colors={[Colors.background1, Colors.background2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.title}>Resumo Financeiro</Text>
      <Text style={styles.subtitle}>{catchDate()}</Text>
      <Shadow
        containerStyle={styles.monthlyContainer}
        style={styles.monthlyShadow}
        distance={3}
        startColor="rgba(0, 0, 0, 0.05)"
        offset={[0, 3]}
      >
        <LinearGradient
          colors={[Colors.primaryLight, Colors.primary]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 12, padding: 20 }}
        >
          <Text style={styles.monthlyDataLabel}>Saldo do Mês</Text>
          <Text style={styles.monthlyDataValue}>
            R$ {formatMoney(monthlySummary.balance)}
          </Text>
          <View style={styles.monthlyDataDivider} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialDesignIcons
                  name="arrow-up-circle-outline"
                  size={12}
                  color={Colors.surface}
                />
                <Text style={styles.monthlyDataSecondaryLabel}>Entradas</Text>
              </View>
              <Text style={styles.monthlyDataSecondaryValue}>
                R$ {formatMoney(monthlySummary.income)}
              </Text>
            </View>
            <View style={{ marginLeft: 80 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialDesignIcons
                  name="arrow-down-circle-outline"
                  size={12}
                  color={Colors.surface}
                />
                <Text style={styles.monthlyDataSecondaryLabel}>Saídas</Text>
              </View>
              <Text style={styles.monthlyDataSecondaryValue}>
                R$ {formatMoney(monthlySummary.expenses)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Shadow>
      <ScrollView
        style={{ flex: 1, marginTop: 16 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <View style={styles.trasactionsRowContainer}>
          <Shadow
            containerStyle={styles.transactionsCardShadowContainer}
            style={styles.transactionsShadowCardContainer}
            distance={3}
            startColor="rgba(0, 0, 0, 0.05)"
            offset={[0, 3]}
          >
            <View style={styles.transactionsCardContainer}>
              <MaterialDesignIcons
                name="wallet-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.transactionsQuantity}>
                {monthlyTransactions.length}
              </Text>
              <Text style={styles.transactionsLabel}>Transações</Text>
            </View>
          </Shadow>

          <Shadow
            containerStyle={styles.transactionsCardShadowContainer}
            style={styles.transactionsShadowCardContainer}
            distance={3}
            startColor="rgba(0, 0, 0, 0.05)"
            offset={[0, 3]}
          >
            <View style={styles.transactionsCardContainer}>
              <MaterialDesignIcons
                name="chart-line-variant"
                size={20}
                color={Colors.error}
              />
              <Text style={styles.transactionsQuantity}>
                R$ {formatMoney(monthlyAvarageExpenses)}
              </Text>
              <Text style={styles.transactionsLabel}>Gasto Médio</Text>
            </View>
          </Shadow>
        </View>

        <Shadow
          containerStyle={styles.lastSevenDaysShadowContainer}
          style={styles.lastSevenDaysShadow}
          distance={3}
          startColor="rgba(0, 0, 0, 0.05)"
          offset={[0, 3]}
        >
          <View style={styles.lastSevenDaysContainer}>
            <Text style={styles.lastSevenDaysTitle}>Últimos 7 dias</Text>
            <BarChart
              data={chartData}
              noOfSections={4}
              rulesColor="rgba(0,0,0,0.12)"
              rulesThickness={1}
              maxValue={maxValue}
              minHeight={1}
              barWidth={BAR_WIDTH}
              barBorderTopLeftRadius={3}
              barBorderTopRightRadius={3}
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor="rgba(0,0,0,0.3)"
              yAxisColor="rgba(0,0,0,0.3)"
              xAxisLabelTextStyle={axisLabelTextStyle}
              yAxisTextStyle={axisLabelTextStyle}
              yAxisTextNumberOfLines={1}
              yAxisLabelWidth={32}
            />
          </View>
        </Shadow>
        <Shadow
          containerStyle={styles.recentsTransactionsShadowContainer}
          style={styles.recentsTransactionsShadow}
          distance={3}
          startColor="rgba(0, 0, 0, 0.05)"
          offset={[0, 3]}
        >
          <View style={styles.recentsTransactionsContainer}>
            <Text style={styles.recentsTransactionsTitle}>
              Transações Recentes
            </Text>
            {renderMonthlyTransactions()}
          </View>
        </Shadow>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Monthly Summary Styles
  monthlyContainer: {
    marginTop: 16,
    borderRadius: 12,
  },
  monthlyShadow: {
    borderRadius: 12,
    width: '100%',
  },
  monthlyDataLabel: {
    fontSize: 12,
    color: Colors.surfaceAlt,
  },
  monthlyDataValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  monthlyDataDivider: {
    height: 1,
    backgroundColor: Colors.surfaceAlt,
    marginTop: 20,
    marginBottom: 16,
  },
  monthlyDataSecondaryLabel: {
    fontSize: 10,
    color: Colors.surfaceAlt,
    marginLeft: 4,
  },
  monthlyDataSecondaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.surface,
  },

  // Transactions Styles
  trasactionsRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 24,
  },
  transactionsCardShadowContainer: {
    flex: 1,
  },
  transactionsCardContainer: {
    width: '100%',
    flexDirection: 'column',
    backgroundColor: Colors.surface,
    gap: 2,
    padding: 16,
    borderRadius: 12,
  },
  transactionsShadowCardContainer: {
    borderRadius: 12,
    width: '100%',
  },
  transactionsQuantity: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  transactionsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Last 7 Days Styles
  lastSevenDaysShadowContainer: {
    width: '100%',
    marginTop: 24,
  },
  lastSevenDaysShadow: {
    borderRadius: 12,
    width: '100%',
  },
  lastSevenDaysContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  lastSevenDaysTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  // Recent Transactions Styles
  recentsTransactionsShadowContainer: {
    width: '100%',
    marginTop: 24,
  },
  recentsTransactionsShadow: {
    borderRadius: 12,
    width: '100%',
  },
  recentsTransactionsContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  recentsTransactionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
});

export default DashboardScreen;
