import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../theme';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';
import { Shadow } from 'react-native-shadow-2';
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  listTransactions,
  removeTransaction,
  saveTransaction,
  Transaction,
  updateTransaction,
} from '../services/transactionService';
import { useFocusEffect } from '@react-navigation/native';

//==================================================================================
// Types
//==================================================================================

//==================================================================================
// Constants
//==================================================================================

const TRANSACTIONS_TYPE_OPTIONS = [
  { label: 'Saída', value: 'expense' },
  { label: 'Entrada', value: 'income' },
];

const TRANSACTIONS_FILTER_TYPE_OPTIONS = [
  { label: 'Todos', value: 'all' },
  { label: 'Saída', value: 'expense' },
  { label: 'Entrada', value: 'income' },
];

//==================================================================================
// Main Component
//==================================================================================

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [addTransactionVisible, setAddTransactionVisible] = useState(false);
  const [addTypeDropdownVisible, setAddTypeDropdownVisible] = useState(false);
  const [addCategoryDropdownVisible, setAddCategoryDropdownVisible] =
    useState(false);
    const [updateTypeDropdownVisible, setUpdateTypeDropdownVisible] = useState(false);
  const [updateCategoryDropdownVisible, setUpdateCategoryDropdownVisible] = useState(false);
  const [filterTypeDropdownVisible, setFilterTypeDropdownVisible] =
    useState(false);
  const [filterCategoryDropdownVisible, setFilterCategoryDropdownVisible] =
    useState(false);
  const [transactionsCategoryOptions, setTransactionsCategoryOptions] =
    useState<{ label: string; value: string }[]>([]);
  const [
    transactionsFilterCategoryOptions,
    setTransactionsFilterCategoryOptions,
  ] = useState<{ label: string; value: string }[]>([]);
  const [updateTransactionVisible, setUpdateTransactionVisible] = useState(false);

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
      const loadCategories = async () => {
        const raw = await AsyncStorage.getItem('CATEGORIES');
        const categories = raw ? JSON.parse(raw) : [];
        const options = categories.map((cat: any) => ({
          label: cat.name,
          value: cat.id,
          type: cat.type,
        }));
        setTransactionsCategoryOptions(options);
        const filterOptions = [
          { label: 'Todas', value: 'all', type: 'all' },
          ...options,
        ];
        setTransactionsFilterCategoryOptions(filterOptions);
        setTransactionFilterCategory(filterOptions[0]);
      };
      loadCategories();
    }, []),
  );

  //==================================================================================
  // Handlers
  //==================================================================================

  const handleAddTransaction = async () => {
    try {
      await saveTransaction({
        description: addTransactionDescriptionValue,
        value: valueFloat,
        categoryId: addTransactionCategoryValue!.value,
        categoryName: addTransactionCategoryValue!.label,
        date: addTransactionDateValue,
        type: addTransactionTypeValue.value,
      });
      listTransactions().then(setTransactions);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      return;
    }
    setAddTransactionVisible(false);
    handleCleanForm();
  };

  const handleCleanForm = () => {
    setAddTransactionTypeValue(TRANSACTIONS_TYPE_OPTIONS[0]);
    setAddTransactionDescriptionValue('');
    setAddTransactionValueText('');
    setValueFloat(0);
    setAddTransactionCategoryValue(null);
    setAddTransactionDateValue(new Date());
  };

  const handleRemoveTransaction = async (id: string) => {
    await removeTransaction(id);
    const list = await listTransactions();
    setTransactions(list);
  };

  const handleUpdateTransaction = async () => {
    const selected = transactions.find(cat => cat.id === updateTransactionIdValue);
    const trimmedDescription = updateTransactionDescriptionValue.trim();
    if (trimmedDescription === '') {
      return;
    }

    try {
      await updateTransaction({
        id: selected?.id ?? '',
        type: updateTransactionTypeValue.value,
        description: trimmedDescription,
        value: updateValueFloat,
        categoryId: updateTransactionCategoryValue?.value ?? '',
        categoryName: updateTransactionCategoryValue?.label ?? '',
        date: updateTransactionDateValue,
      });
      handleCleanForm();
      listTransactions().then(setTransactions);
      setUpdateTransactionVisible(false);
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
    }
  };

  //==================================================================================
  // Add Form States
  //==================================================================================

  // Type Form States
  const [addTransactionTypeValue, setAddTransactionTypeValue] = useState(
    TRANSACTIONS_TYPE_OPTIONS[0],
  );
  const openTypeSheet = () => {
    setAddTypeDropdownVisible(prev => !prev);
  };
  const closeTypeSheet = () => {
    setAddTypeDropdownVisible(false);
  };
  const handleTypeSelect = (
    item: (typeof TRANSACTIONS_TYPE_OPTIONS)[number],
  ) => {
    setAddTransactionTypeValue(item);
    closeTypeSheet();
  };

  // Description Form State
  const [addTransactionDescriptionValue, setAddTransactionDescriptionValue] =
    useState('');

  // Value Form State
  const [addTransactionValueText, setAddTransactionValueText] = useState('');
  const [valueFloat, setValueFloat] = useState(0);
  const formatMoney = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  const onChangeValue = (text: string) => {
    setAddTransactionValueText(text);
    const num = Number(text.replace(',', '.'));
    setValueFloat(Number.isFinite(num) ? num : 0);
  };

  // Category Form States
  const [addTransactionCategoryValue, setAddTransactionCategoryValue] =
    useState<{ label: string; value: string } | null>(null);

  const openCategorySheet = () => {
    setAddCategoryDropdownVisible(prev => !prev);
  };
  const closeCategorySheet = () => {
    setAddCategoryDropdownVisible(false);
  };
  const handleCategorySelect = (
    item: (typeof transactionsCategoryOptions)[number],
  ) => {
    setAddTransactionCategoryValue(item);
    closeCategorySheet();
  };

  // Date Form States
  const [addTransactionDateValue, setAddTransactionDateValue] = useState(
    new Date(),
  );
  const datePickerField = () => {
    const [show, setShow] = useState(false);

    const onChange = (_: any, selectedDate?: Date) => {
      setShow(false);
      if (selectedDate) setAddTransactionDateValue(selectedDate);
    };

    const formatDate = (d: Date) => d.toLocaleDateString('pt-BR');

    return (
      <View style={styles.addTransactionModalInputContainer}>
        <Text style={styles.addTransactionModalInputLabel}>Data</Text>
        <View style={styles.addTransactionModalInputButton}>
          <Text style={styles.addTransactionModalInputButtonText}>
            {formatDate(addTransactionDateValue)}
          </Text>
          <TouchableOpacity onPress={() => setShow(true)}>
            <MaterialDesignIcons
              name="calendar-month"
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {show && (
            <DateTimePicker
              value={addTransactionDateValue}
              mode="date"
              display="calendar" // Android
              onValueChange={onChange}
              maximumDate={new Date()}
            />
          )}
        </View>
      </View>
    );
  };

   //==================================================================================
  // Update Form States
  //==================================================================================
  const [updateTransactionIdValue, setUpdateTransactionIdValue] = useState('');

  // Type Form States
  const [updateTransactionTypeValue, setUpdateTransactionTypeValue] = useState(
    TRANSACTIONS_TYPE_OPTIONS[0],
  );
  const openUpdateTypeSheet = () => {
    setUpdateTypeDropdownVisible(prev => !prev);
  };
  const closeUpdateTypeSheet = () => {
    setUpdateTypeDropdownVisible(false);
  };
  const handleUpdateTypeSelect = (
    item: (typeof TRANSACTIONS_TYPE_OPTIONS)[number],
  ) => {
    setUpdateTransactionTypeValue(item);
    closeUpdateTypeSheet();
  };

  // Description Form State
  const [updateTransactionDescriptionValue, setUpdateTransactionDescriptionValue] =
    useState('');

  // Value Form State
  const [updateTransactionValueText, setUpdateTransactionValueText] = useState('');
  const [updateValueFloat, setUpdateValueFloat] = useState(0);
  const onChangeUpdateValue = (text: string) => {
    setUpdateTransactionValueText(text);
    const num = Number(text.replace(',', '.'));
    setUpdateValueFloat(Number.isFinite(num) ? num : 0);
  };

  // Category Form States
  const [updateTransactionCategoryValue, setUpdateTransactionCategoryValue] =
    useState<{ label: string; value: string } | null>(null);

  const openUpdateCategorySheet = () => {
    setUpdateCategoryDropdownVisible(prev => !prev);
  };
  const closeUpdateCategorySheet = () => {
    setUpdateCategoryDropdownVisible(false);
  };
  const handleUpdateCategorySelect = (
    item: (typeof transactionsCategoryOptions)[number],
  ) => {
    setUpdateTransactionCategoryValue(item);
    closeUpdateCategorySheet();
  };

  // Date Form States
  const [updateTransactionDateValue, setUpdateTransactionDateValue] = useState(
    new Date(),
  );
  const updateDatePickerField = () => {
    const [show, setShow] = useState(false);

    const onChange = (_: any, selectedDate?: Date) => {
      setShow(false);
      if (selectedDate) setUpdateTransactionDateValue(selectedDate);
    };

    const formatDate = (d: Date) => d.toLocaleDateString('pt-BR');

    return (
      <View style={styles.addTransactionModalInputContainer}>
        <Text style={styles.addTransactionModalInputLabel}>Data</Text>
        <View style={styles.addTransactionModalInputButton}>
          <Text style={styles.addTransactionModalInputButtonText}>
            {formatDate(updateTransactionDateValue)}
          </Text>
          <TouchableOpacity onPress={() => setShow(true)}>
            <MaterialDesignIcons
              name="calendar-month"
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {show && (
            <DateTimePicker
              value={updateTransactionDateValue}
              mode="date"
              display="calendar" // Android
              onValueChange={onChange}
              maximumDate={new Date()}
            />
          )}
        </View>
      </View>
    );
  };


  //==================================================================================
  // Filter States
  //==================================================================================

  // Type Filter States
  const [filterTransactionType, setFilterTransactionType] = useState(
    TRANSACTIONS_FILTER_TYPE_OPTIONS[0],
  );
  const openFilterTypeSheet = () => {
    setFilterTypeDropdownVisible(prev => !prev);
  };
  const closeFilterTypeSheet = () => {
    setFilterTypeDropdownVisible(false);
  };
  const handleFilterTypeSelect = (
    item: (typeof TRANSACTIONS_FILTER_TYPE_OPTIONS)[number],
  ) => {
    setFilterTransactionType(item);
    closeFilterTypeSheet();
  };

  // Category Filter States
  const [transactionFilterCategory, setTransactionFilterCategory] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const openFilterCategorySheet = () => {
    setFilterCategoryDropdownVisible(prev => !prev);
  };
  const closeFilterCategorySheet = () => {
    setFilterCategoryDropdownVisible(false);
  };
  const handleFilterCategorySelect = (
    item: (typeof transactionsFilterCategoryOptions)[number],
  ) => {
    setTransactionFilterCategory(item);
    closeFilterCategorySheet();
  };

  //==================================================================================
  // Renders
  //==================================================================================

  const addTransactionModal = () => {
    const optionsFiltered = transactionsCategoryOptions.filter(
      (opt: any) => opt.type === addTransactionTypeValue.value,
    );

    return (
      <Modal transparent visible={addTransactionVisible} statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.addTransactionModalContainer}>
            <Text style={styles.addTransactionModalTitle}>Nova Transação</Text>
            <Text style={styles.addTransactionModalSubTitle}>
              Adicione uma nova entrada ou saída
            </Text>

            {/* Formulário para adicionar categoria */}
            <View style={styles.addTransactionModalInputContainer}>
              <Text style={styles.addTransactionModalInputLabel}>Tipo</Text>
              <TouchableOpacity
                style={styles.addTransactionModalInputButton}
                onPress={openTypeSheet}
              >
                <Text style={styles.addTransactionModalInputButtonText}>
                  {addTransactionTypeValue.label}
                </Text>
                <MaterialDesignIcons
                  name={addTypeDropdownVisible ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {addTypeDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {TRANSACTIONS_TYPE_OPTIONS.map(item => {
                    const isSelected =
                      item.value === addTransactionTypeValue.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleTypeSelect(item)}
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

            <View style={styles.addTransactionModalInputContainer}>
              <Text style={styles.addTransactionModalInputLabel}>
                Descrição
              </Text>
              <TextInput
                style={styles.addTransactionModalInputButton}
                placeholder="Ex: Salário, Aluguel, etc."
                placeholderTextColor={Colors.textSecondary}
                value={addTransactionDescriptionValue}
                onChangeText={setAddTransactionDescriptionValue}
              />
            </View>

            <View style={styles.addTransactionModalInputContainer}>
              <Text style={styles.addTransactionModalInputLabel}>Valor</Text>
              <TextInput
                style={styles.addTransactionModalInputButton}
                placeholderTextColor={Colors.textSecondary}
                placeholder="0.00"
                value={addTransactionValueText}
                onChangeText={onChangeValue}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.addTransactionModalInputContainer}>
              <Text style={styles.addTransactionModalInputLabel}>
                Categoria
              </Text>
              <TouchableOpacity
                style={styles.addTransactionModalInputButton}
                onPress={openCategorySheet}
              >
                <Text
                  style={[
                    addTransactionCategoryValue
                      ? styles.addTransactionModalInputButtonText
                      : styles.addTransactionModalInputButtonTextUnselected,
                  ]}
                >
                  {addTransactionCategoryValue
                    ? addTransactionCategoryValue.label
                    : 'Selecione uma categoria'}
                </Text>
                <MaterialDesignIcons
                  name={
                    addCategoryDropdownVisible ? 'chevron-up' : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {addCategoryDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {optionsFiltered.map(item => {
                    const isSelected =
                      addTransactionCategoryValue &&
                      item.value === addTransactionCategoryValue.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleCategorySelect(item)}
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

            {datePickerField()}

            {/* Botão para adicionar transação */}
            <TouchableOpacity
              onPress={handleAddTransaction}
              style={[
                styles.addTransactionModalButton,
                (addTransactionDescriptionValue.trim() === '' ||
                  valueFloat <= 0 ||
                  !addTransactionCategoryValue) &&
                  styles.addTransactionModalButtonDisabled,
              ]}
              disabled={
                addTransactionDescriptionValue.trim() === '' ||
                valueFloat <= 0 ||
                !addTransactionCategoryValue
              }
            >
              <Text style={styles.addTransactionModalButtonText}>
                Adicionar Transação
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setAddTransactionVisible(false);
                handleCleanForm();
              }}
              style={styles.closeModalButton}
            >
              <MaterialDesignIcons
                name="close"
                size={16}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const updateTransactionModal = () => {
    const optionsFiltered = transactionsCategoryOptions.filter(
      (opt: any) => opt.type === updateTransactionTypeValue.value,
    );

    return (
      <Modal transparent visible={updateTransactionVisible} statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.addTransactionModalContainer}>
            <Text style={styles.addTransactionModalTitle}>Editar Transação</Text>
            <Text style={styles.addTransactionModalSubTitle}>
              Edite os dados da transação
            </Text>

            {/* Formulário para editar transação */}
            <View style={styles.addTransactionModalInputContainer}>
              <Text style={styles.addTransactionModalInputLabel}>Tipo</Text>
              <TouchableOpacity
                style={styles.addTransactionModalInputButton}
                onPress={openUpdateTypeSheet}
              >
                <Text style={styles.addTransactionModalInputButtonText}>
                  {updateTransactionTypeValue.label}
                </Text>
                <MaterialDesignIcons
                  name={updateTypeDropdownVisible ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {updateTypeDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {TRANSACTIONS_TYPE_OPTIONS.map(item => {
                    const isSelected =
                      item.value === updateTransactionTypeValue.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleUpdateTypeSelect(item)}
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

            <View style={styles.addTransactionModalInputContainer}>
              <Text style={styles.addTransactionModalInputLabel}>
                Descrição
              </Text>
              <TextInput
                style={styles.addTransactionModalInputButton}
                placeholder="Ex: Salário, Aluguel, etc."
                placeholderTextColor={Colors.textSecondary}
                value={updateTransactionDescriptionValue}
                onChangeText={setUpdateTransactionDescriptionValue}
              />
            </View>

            <View style={styles.addTransactionModalInputContainer}>
              <Text style={styles.addTransactionModalInputLabel}>Valor</Text>
              <TextInput
                style={styles.addTransactionModalInputButton}
                placeholderTextColor={Colors.textSecondary}
                placeholder="0.00"
                value={updateTransactionValueText}
                onChangeText={onChangeUpdateValue}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.addTransactionModalInputContainer}>
              <Text style={styles.addTransactionModalInputLabel}>
                Categoria
              </Text>
              <TouchableOpacity
                style={styles.addTransactionModalInputButton}
                onPress={openUpdateCategorySheet}
              >
                <Text
                  style={[
                    updateTransactionCategoryValue
                      ? styles.addTransactionModalInputButtonText
                      : styles.addTransactionModalInputButtonTextUnselected,
                  ]}
                >
                  {updateTransactionCategoryValue
                    ? updateTransactionCategoryValue.label
                    : 'Selecione uma categoria'}
                </Text>
                <MaterialDesignIcons
                  name={
                    updateCategoryDropdownVisible ? 'chevron-up' : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {updateCategoryDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {optionsFiltered.map(item => {
                    const isSelected =
                      updateTransactionCategoryValue &&
                      item.value === updateTransactionCategoryValue.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleUpdateCategorySelect(item)}
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

            {updateDatePickerField()}

            {/* Botão para atualizar transação */}
            <TouchableOpacity
              onPress={handleUpdateTransaction}
              style={[
                styles.addTransactionModalButton,
                (updateTransactionDescriptionValue.trim() === '' ||
                  updateValueFloat <= 0 ||
                  !updateTransactionCategoryValue) &&
                  styles.addTransactionModalButtonDisabled,
              ]}
              disabled={
                updateTransactionDescriptionValue.trim() === '' ||
                updateValueFloat <= 0 ||
                !updateTransactionCategoryValue
              }
            >
              <Text style={styles.addTransactionModalButtonText}>
                Atualizar Transação
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setUpdateTransactionVisible(false);
                handleCleanForm();
              }}
              style={styles.closeModalButton}
            >
              <MaterialDesignIcons
                name="close"
                size={16}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

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
              <Text style={styles.filterTitleLabel}>Tipo</Text>
              <TouchableOpacity
                style={styles.filterButtonContainer}
                onPress={openFilterTypeSheet}
              >
                <Text style={styles.filterOptionLabel}>
                  {filterTransactionType.label}
                </Text>
                <MaterialDesignIcons
                  name={
                    filterTypeDropdownVisible ? 'chevron-up' : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {filterTypeDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {TRANSACTIONS_FILTER_TYPE_OPTIONS.map(item => {
                    const isSelected =
                      item.value === filterTransactionType.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleFilterTypeSelect(item)}
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
              <Text style={styles.filterTitleLabel}>Categoria</Text>

              <TouchableOpacity
                style={styles.filterButtonContainer}
                onPress={openFilterCategorySheet}
              >
                <Text style={styles.filterOptionLabel}>
                  {transactionFilterCategory?.label ?? 'Todas'}
                </Text>
                <MaterialDesignIcons
                  name={
                    filterCategoryDropdownVisible
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {filterCategoryDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {transactionsFilterCategoryOptions.map(item => {
                    const isSelected =
                      item.value === transactionFilterCategory?.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleFilterCategorySelect(item)}
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

  const renderTransactions = () => {
    const isAllCategories = transactionFilterCategory?.value === 'all';
    const isAllTypes = filterTransactionType.value === 'all';

    const filtered = transactions.filter(transaction => {
      const matchType = isAllTypes
        ? true
        : transaction.type === filterTransactionType.value;
      const matchCategory = isAllCategories
        ? true
        : transaction.categoryId === transactionFilterCategory?.value;

      return matchType && matchCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return bTime - aTime;
    });

    return (
      <View style={styles.transactionsContainer}>
        <FlatList
          data={sorted}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Shadow
              containerStyle={styles.transactionShadowContainer}
              style={styles.transactionShadow}
              distance={3}
              startColor="rgba(0, 0, 0, 0.05)"
              offset={[0, 3]}
            >
              <View style={styles.transactionContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor:
                        item.type === 'income'
                          ? Colors.successBackground
                          : Colors.errorBackground,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialDesignIcons
                      name={
                        item.type === 'income'
                          ? 'arrow-up-bold-circle-outline'
                          : 'arrow-down-bold-circle-outline'
                      }
                      size={16}
                      color={
                        item.type === 'income' ? Colors.success : Colors.error
                      }
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{ color: Colors.textPrimary, fontWeight: 'bold' }}
                    >
                      {item.description}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{ color: Colors.textSecondary, fontSize: 12 }}
                      >
                        {item.categoryName}
                      </Text>
                      <View
                        style={{
                          width: 3,
                          height: 3,
                          borderRadius: 100,
                          backgroundColor:
                            item.type === 'income'
                              ? Colors.success
                              : Colors.error,
                        }}
                      />
                      <Text
                        style={{ color: Colors.textSecondary, fontSize: 12 }}
                      >
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 12,
                  }}
                >
                  <Text
                    style={{
                      color:
                        item.type === 'income' ? Colors.success : Colors.error,
                      fontWeight: 'bold',
                      marginTop: 4,
                    }}
                  >
                    {item.type === 'income' ? '+' : '-'} R${' '}
                    {formatMoney(item.value)}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setUpdateTransactionVisible(true);
                        setUpdateTransactionIdValue(item.id);
                        setUpdateTransactionDescriptionValue(item.description);
                        setUpdateTransactionValueText(item.value.toString());
                        setUpdateValueFloat(item.value);
                        setUpdateTransactionTypeValue(
                          TRANSACTIONS_TYPE_OPTIONS.find(
                            opt => opt.value === item.type,
                          ) ?? TRANSACTIONS_TYPE_OPTIONS[0],
                        );
                        setUpdateTransactionCategoryValue({
                          label: item.categoryName,
                          value: item.categoryId,
                        });
                        setUpdateTransactionDateValue(new Date(item.date));
                      }}
                    >
                      <MaterialDesignIcons
                        name="pencil-outline"
                        size={16}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveTransaction(item.id)}
                    >
                      <MaterialDesignIcons
                        name="trash-can-outline"
                        size={16}
                        color={Colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Shadow>
          )}
        />
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
      <View style={styles.titleContainer}>
        <View>
          <Text style={styles.title}>Transações</Text>
          <Text style={styles.subtitle}>Gerencie suas entradas e saídas</Text>
        </View>
        <TouchableOpacity
          onPress={() => setAddTransactionVisible(true)}
          style={styles.addTransactionButton}
        >
          <MaterialDesignIcons name="plus" size={24} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      {renderFilter()}
      {renderTransactions()}

      {addTransactionModal()}
      {updateTransactionModal()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addTransactionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 8,
  },

  //Filter Styles
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTransactionModalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTransactionModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addTransactionModalSubTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  addTransactionModalButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  addTransactionModalButtonDisabled: {
    backgroundColor: Colors.primaryLight,
  },
  addTransactionModalButtonText: {
    fontSize: 16,
    color: Colors.surface,
    fontWeight: 'bold',
  },
  closeModalButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 8,
  },
  addTransactionModalInputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  addTransactionModalInputLabel: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  addTransactionModalInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceAlt,
  },
  addTransactionModalInputButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  addTransactionModalInputButtonTextUnselected: {
    color: Colors.textSecondary,
    fontWeight: '400',
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

  //Transaction Styles
  transactionsContainer: {
    flex: 1,
    width: '100%',
  },
  transactionShadowContainer: {
    width: '100%',
    marginBottom: 12,
  },
  transactionShadow: {
    borderRadius: 8,
  },
  transactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
});
