import {
  ActivityIndicator,
  DimensionValue,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme';
import { Shadow } from 'react-native-shadow-2';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { listTransactions, Transaction } from '../services/transactionService';
import { CurveType, LineChart } from 'react-native-gifted-charts';

const MONTH_OPTIONS = [
  { label: 'Janeiro', value: 0 },
  { label: 'Fevereiro', value: 1 },
  { label: 'Março', value: 2 },
  { label: 'Abril', value: 3 },
  { label: 'Maio', value: 4 },
  { label: 'Junho', value: 5 },
  { label: 'Julho', value: 6 },
  { label: 'Agosto', value: 7 },
  { label: 'Setembro', value: 8 },
  { label: 'Outubro', value: 9 },
  { label: 'Novembro', value: 10 },
  { label: 'Dezembro', value: 11 },
];

const MONTH_LABELS_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, index) => {
  const year = CURRENT_YEAR - index;
  return { label: String(year), value: year };
});

export default function ReportsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterMonthDropdownVisible, setFilterMonthDropdownVisible] =
    useState(false);
  const [filterYearDropdownVisible, setFilterYearDropdownVisible] =
    useState(false);
  const [filterMonth, setFilterMonth] = useState(
    MONTH_OPTIONS[new Date().getMonth()],
  );
  const [filterYear, setFilterYear] = useState(YEAR_OPTIONS[0]);

  const openFilterMonthSheet = () => {
    setFilterMonthDropdownVisible(prev => !prev);
  };
  const closeFilterMonthSheet = () => {
    setFilterMonthDropdownVisible(false);
  };
  const handleFilterMonthSelect = (item: (typeof MONTH_OPTIONS)[number]) => {
    setFilterMonth(item);
    closeFilterMonthSheet();
  };

  const openFilterYearSheet = () => {
    setFilterYearDropdownVisible(prev => !prev);
  };
  const closeFilterYearSheet = () => {
    setFilterYearDropdownVisible(false);
  };
  const handleFilterYearSelect = (item: (typeof YEAR_OPTIONS)[number]) => {
    setFilterYear(item);
    closeFilterYearSheet();
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        setIsLoading(true);
        setTransactions([]);
        try {
          const list = await listTransactions();
          if (!isActive) return;
          setTransactions(list);
        } finally {
          if (isActive) setIsLoading(false);
        }
      };

      load();
      return () => {
        isActive = false;
      };
    }, []),
  );

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return (
      date.getMonth() === filterMonth.value &&
      date.getFullYear() === filterYear.value
    );
  });

  const summary = {
    income: filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0),
    expense: filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0),
  };
  const balance = summary.income - summary.expense;

  const previousMonthValue =
    filterMonth.value === 0 ? 11 : filterMonth.value - 1;
  const previousYearValue =
    filterMonth.value === 0 ? filterYear.value - 1 : filterYear.value;
  const previousMonthExpenses = transactions
    .filter(t => {
      const date = new Date(t.date);
      return (
        date.getMonth() === previousMonthValue &&
        date.getFullYear() === previousYearValue &&
        t.type === 'expense'
      );
    })
    .reduce((sum, t) => sum + t.value, 0);

  const expenseChangePercent =
    previousMonthExpenses === 0
      ? 0
      : ((summary.expense - previousMonthExpenses) / previousMonthExpenses) *
        100;
  const expenseChangeDisplay = Math.abs(expenseChangePercent);
  const expenseChangeLabel = `${expenseChangeDisplay.toFixed(
    1,
  )}% vs mês anterior`;
  const expenseChangePositive = expenseChangePercent <= 0;

  const lastSixMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(filterYear.value, filterMonth.value - (5 - index), 1);
    return {
      month: date.getMonth(),
      year: date.getFullYear(),
      label: MONTH_LABELS_SHORT[date.getMonth()],
    };
  });

  const trendSeries = lastSixMonths.map(item => {
    const totals = transactions.reduce(
      (acc, t) => {
        const date = new Date(t.date);
        if (
          date.getMonth() === item.month &&
          date.getFullYear() === item.year
        ) {
          if (t.type === 'income') acc.income += t.value;
          if (t.type === 'expense') acc.expense += t.value;
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );
    return {
      label: item.label,
      income: totals.income,
      expense: totals.expense,
    };
  });

  const trendIncomeData = [
    { value: 0, label: '' },
    ...trendSeries.map(item => ({
      value: item.income,
      label: item.label,
    })),
  ];
  const trendExpenseData = [
    { value: 0 },
    ...trendSeries.map(item => ({
      value: item.expense,
    })),
  ];
  const trendMaxValue =
    Math.max(1, ...trendSeries.flatMap(item => [item.income, item.expense])) *
    1.2;

  const expenseTransactions = filteredTransactions.filter(
    t => t.type === 'expense',
  );
  const expenseTotal = expenseTransactions.reduce((sum, t) => sum + t.value, 0);
  const expenseByCategory = expenseTransactions.reduce<
    Record<string, { id: string; name: string; total: number }>
  >((acc, t) => {
    const existing = acc[t.categoryId] ?? {
      id: t.categoryId,
      name: t.categoryName,
      total: 0,
    };
    existing.total += t.value;
    acc[t.categoryId] = existing;
    return acc;
  }, {});

  const topCategories = Object.values(expenseByCategory)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  //==================================================================================
  // Renders
  //==================================================================================

  const renderFilter = () => {
    return (
      <>
        <Shadow
          containerStyle={styles.cardShadowFilterContainer}
          style={styles.cardFilterShadow}
          distance={3}
          startColor="rgba(0, 0, 0, 0.05)"
          offset={[0, 3]}
        >
          <View style={styles.cardFilterContainer}>
            <View style={styles.filterContainer}>
              <Text style={styles.filterTitleLabel}>Mês</Text>
              <TouchableOpacity
                style={styles.filterButtonContainer}
                onPress={openFilterMonthSheet}
              >
                <Text style={styles.filterOptionLabel}>
                  {filterMonth.label}
                </Text>
                <MaterialDesignIcons
                  name={
                    filterMonthDropdownVisible ? 'chevron-up' : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {filterMonthDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {MONTH_OPTIONS.map(item => {
                    const isSelected = item.value === filterMonth.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleFilterMonthSelect(item)}
                      >
                        <Text
                          style={[
                            styles.inlineDropdownOptionText,
                            isSelected &&
                              styles.inlineDropdownOptionTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isSelected && (
                          <MaterialDesignIcons
                            name="check"
                            size={16}
                            color={Colors.textSecondary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
            <View style={styles.filterContainer}>
              <Text style={styles.filterTitleLabel}>Ano</Text>

              <TouchableOpacity
                style={styles.filterButtonContainer}
                onPress={openFilterYearSheet}
              >
                <Text style={styles.filterOptionLabel}>{filterYear.label}</Text>
                <MaterialDesignIcons
                  name={
                    filterYearDropdownVisible ? 'chevron-up' : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {filterYearDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {YEAR_OPTIONS.map(item => {
                    const isSelected = item.value === filterYear.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleFilterYearSelect(item)}
                      >
                        <Text
                          style={[
                            styles.inlineDropdownOptionText,
                            isSelected &&
                              styles.inlineDropdownOptionTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isSelected && (
                          <MaterialDesignIcons
                            name="check"
                            size={16}
                            color={Colors.textSecondary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </Shadow>
      </>
    );
  };

  const renderSummaryCards = () => {
    return (
      <>
        <Shadow
          containerStyle={styles.summaryCardShadowContainer}
          style={styles.summaryCardShadow}
          distance={3}
          startColor="rgba(0, 0, 0, 0.05)"
          offset={[0, 3]}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <Text style={styles.summaryLabel}>Total de Entradas</Text>
              <Text style={[styles.summaryValue, styles.summaryValueSuccess]}>
                R$ {formatMoney(summary.income)}
              </Text>
            </View>
            <MaterialDesignIcons
              name="trending-up"
              size={28}
              color={Colors.success}
            />
          </View>
        </Shadow>

        <Shadow
          containerStyle={styles.summaryCardShadowContainer}
          style={styles.summaryCardShadow}
          distance={3}
          startColor="rgba(0, 0, 0, 0.05)"
          offset={[0, 3]}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <Text style={styles.summaryLabel}>Total de Saídas</Text>
              <Text style={[styles.summaryValue, styles.summaryValueError]}>
                R$ {formatMoney(summary.expense)}
              </Text>
              <View style={styles.summaryMetaRow}>
                <MaterialDesignIcons
                  name={expenseChangePositive ? 'arrow-down' : 'arrow-up'}
                  size={14}
                  color={expenseChangePositive ? Colors.success : Colors.error}
                />
                <Text
                  style={[
                    styles.summaryMetaText,
                    expenseChangePositive
                      ? styles.summaryMetaTextSuccess
                      : styles.summaryMetaTextError,
                  ]}
                >
                  {expenseChangeLabel}
                </Text>
              </View>
            </View>
            <MaterialDesignIcons
              name="trending-down"
              size={28}
              color={Colors.error}
            />
          </View>
        </Shadow>

        <Shadow
          containerStyle={styles.summaryCardShadowContainer}
          style={styles.summaryCardShadow}
          distance={3}
          startColor="rgba(0, 0, 0, 0.05)"
          offset={[0, 3]}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <Text style={styles.summaryLabel}>Saldo do Período</Text>
              <Text
                style={[
                  styles.summaryValue,
                  balance >= 0
                    ? styles.summaryValueSuccess
                    : styles.summaryValueError,
                ]}
              >
                R$ {formatMoney(balance)}
              </Text>
            </View>
            <MaterialDesignIcons
              name="currency-usd"
              size={28}
              color={Colors.primary}
            />
          </View>
        </Shadow>
      </>
    );
  };

  const renderTrendCard = () => {
    return (
      <Shadow
        containerStyle={styles.trendCardShadowContainer}
        style={styles.trendCardShadow}
        distance={3}
        startColor="rgba(0, 0, 0, 0.05)"
        offset={[0, 3]}
      >
        <View style={styles.trendCard}>
          <Text style={styles.trendTitle}>Tendência (6 Meses)</Text>
          <LineChart
            data={trendIncomeData}
            data2={trendExpenseData}
            areaChart
            areaChart2
            curved
            curveType={CurveType.QUADRATIC}
            curvature={0.12}
            hideDataPoints
            hideDataPoints2
            thickness={2}
            thickness2={2}
            color={Colors.success}
            color2={Colors.error}
            startFillColor={Colors.success}
            startFillColor2={Colors.error}
            startOpacity={0.2}
            startOpacity2={0.2}
            endOpacity={0}
            endOpacity2={0}
            noOfSections={4}
            rulesColor="rgba(0,0,0,0.12)"
            rulesThickness={1}
            maxValue={trendMaxValue}
            spacing={38}
            initialSpacing={10}
            endSpacing={10}
            yAxisThickness={1}
            xAxisThickness={1}
            xAxisColor="rgba(0,0,0,0.25)"
            yAxisColor="rgba(0,0,0,0.25)"
            yAxisLabelWidth={36}
            xAxisLabelTextStyle={styles.trendAxisLabel}
            yAxisTextStyle={styles.trendAxisLabel}
            height={170}
          />
        </View>
      </Shadow>
    );
  };

  const renderTopCategoriesCard = () => {
    return (
      <Shadow
        containerStyle={styles.categoriesCardShadowContainer}
        style={styles.categoriesCardShadow}
        distance={3}
        startColor="rgba(0, 0, 0, 0.05)"
        offset={[0, 3]}
      >
        <View style={styles.categoriesCard}>
          <Text style={styles.categoriesTitle}>Top 5 Categorias</Text>
          {topCategories.length === 0 ? (
            <Text style={styles.categoriesEmptyText}>
              Sem gastos no período.
            </Text>
          ) : (
            topCategories.map((item, index) => {
              const percent =
                expenseTotal === 0 ? 0 : (item.total / expenseTotal) * 100;
              const clamped = Math.min(100, Math.max(0, percent));
              const fillWidth: DimensionValue = `${Math.max(2, clamped)}%`;

              return (
                <View key={item.id} style={styles.categoryRow}>
                  <View style={styles.categoryRowHeader}>
                    <Text style={styles.categoryName}>
                      {index + 1}. {item.name}
                    </Text>
                    <Text style={styles.categoryValue}>
                      R$ {formatMoney(item.total)}
                    </Text>
                  </View>
                  <View style={styles.categoryProgressTrack}>
                    <View
                      style={[
                        styles.categoryProgressFill,
                        { width: fillWidth },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryPercent}>
                    {clamped.toFixed(1)}% do total
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </Shadow>
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
      <View style={styles.titleContainer}>
        <View>
          <Text style={styles.title}>Relatórios</Text>
          <Text style={styles.subtitle}>Análise detalhada dos seus gastos</Text>
        </View>
      </View>
      {renderFilter()}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : (
          <>
            {renderSummaryCards()}
            {renderTrendCard()}
            {renderTopCategoriesCard()}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  cardFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 16,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  cardShadowFilterContainer: {
    width: '100%',
    marginBottom: 12,
    zIndex: 1,
  },
  cardFilterShadow: {
    borderRadius: 8,
    width: '100%',
  },
  filterContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '50%',
  },
  filterTitleLabel: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  filterButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceAlt,
  },
  filterOptionLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  summaryCardShadowContainer: {
    width: '100%',
    marginTop: 12,
  },
  summaryCardShadow: {
    borderRadius: 12,
    width: '100%',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  summaryCardContent: {
    flexDirection: 'column',
    gap: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  summaryValueSuccess: {
    color: Colors.success,
  },
  summaryValueError: {
    color: Colors.error,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryMetaText: {
    fontSize: 12,
  },
  summaryMetaTextSuccess: {
    color: Colors.success,
  },
  summaryMetaTextError: {
    color: Colors.error,
  },
  trendCardShadowContainer: {
    width: '100%',
    marginTop: 16,
  },
  trendCardShadow: {
    borderRadius: 12,
    width: '100%',
  },
  trendCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  trendAxisLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  categoriesCardShadowContainer: {
    width: '100%',
    marginTop: 16,
  },
  categoriesCardShadow: {
    borderRadius: 12,
    width: '100%',
  },
  categoriesCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  categoriesEmptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  categoryRow: {
    marginBottom: 16,
  },
  categoryRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoryProgressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.surfaceAlt,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  categoryPercent: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  inlineDropdownContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    width: '100%',
    maxHeight: 200,
    padding: 4,
    borderRadius: 6,
    backgroundColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 10,
    overflow: 'hidden',
    zIndex: 999,
  },
  inlineDropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  inlineDropdownOptionSelected: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 6,
  },
  inlineDropdownOptionText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  inlineDropdownOptionTextSelected: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
});
