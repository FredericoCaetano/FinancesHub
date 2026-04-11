import {
  ActivityIndicator,
  FlatList,
  Modal,
  Switch,
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
import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import {
  FixedExpense,
  listFixedExpenses,
  removeFixedExpense,
  saveFixedExpense,
  toggleFixedExpenseStatus,
  updateFixedExpense,
} from '../services/fixedExpensesService';

//==================================================================================
// Constants
//==================================================================================

const FIXED_EXPENSES_TYPE_OPTIONS = [
  { label: 'Saída', value: 'expense' },
  { label: 'Entrada', value: 'income' },
];

const FIXED_EXPENSES_FREQUENCY_OPTIONS: Array<{
  label: string;
  value: FixedExpense['frequency'];
}> = [
  { label: 'Diário', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Mensal', value: 'monthly' },
  { label: 'Anual', value: 'yearly' },
];

//==================================================================================
// Main Component
//==================================================================================

export default function FixedExpensesScreen() {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addFixedExpenseVisible, setAddFixedExpenseVisible] = useState(false);
  const [
    addFixedExpenseTypeDropdownVisible,
    setAddFixedExpenseTypeDropdownVisible,
  ] = useState(false);
  const [
    addFixedExpenseCategoryDropdownVisible,
    setAddFixedExpenseCategoryDropdownVisible,
  ] = useState(false);
  const [
    addFixedExpenseFrequencyDropdownVisible,
    setAddFixedExpenseFrequencyDropdownVisible,
  ] = useState(false);
  const [
    updateFixedExpenseTypeDropdownVisible,
    setUpdateFixedExpenseTypeDropdownVisible,
  ] = useState(false);
  const [
    updateFixedExpenseCategoryDropdownVisible,
    setUpdateFixedExpenseCategoryDropdownVisible,
  ] = useState(false);
  const [
    updateFixedExpenseFrequencyDropdownVisible,
    setUpdateFixedExpenseFrequencyDropdownVisible,
  ] = useState(false);
  const [fixedExpensesCategoryOptions, setFixedExpensesCategoryOptions] =
    useState<{ label: string; value: string }[]>([]);
  const [updateFixedExpenseVisible, setUpdateFixedExpenseVisible] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        setIsLoading(true);
        setFixedExpenses([]);
        setFixedExpensesCategoryOptions([]);
        try {
          const [list, raw] = await Promise.all([
            listFixedExpenses(),
            AsyncStorage.getItem('CATEGORIES'),
          ]);
          if (!isActive) return;
          setFixedExpenses(list);
          const categories = raw ? JSON.parse(raw) : [];
          const options = categories.map((cat: any) => ({
            label: cat.name,
            value: cat.id,
            type: cat.type,
          }));
          setFixedExpensesCategoryOptions(options);
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

  //==================================================================================
  // Handlers
  //==================================================================================

  const handleAddFixedExpense = async () => {
    try {
      await saveFixedExpense({
        type: addFixedExpenseTypeValue.value,
        description: addFixedExpenseDescriptionValue,
        value: fixedExpenseValueFloat,
        categoryId: addFixedExpenseCategoryValue!.value,
        categoryName: addFixedExpenseCategoryValue!.label,
        nextDate: addFixedExpenseDateValue,
        frequency:
          addFixedExpenseFrequencyValue?.value ??
          FIXED_EXPENSES_FREQUENCY_OPTIONS[2].value,
        status: addFixedExpenseStatusValue,
      });
      listFixedExpenses().then(setFixedExpenses);
    } catch (error) {
      console.error('Erro ao salvar gasto fixo:', error);
      return;
    }
    setAddFixedExpenseVisible(false);
    handleCleanForm();
  };

  const handleCleanForm = () => {
    setAddFixedExpenseTypeValue(FIXED_EXPENSES_TYPE_OPTIONS[0]);
    setAddFixedExpenseDescriptionValue('');
    setAddFixedExpenseValueText('');
    setFixedExpenseValueFloat(0);
    setAddFixedExpenseCategoryValue(null);
    setAddFixedExpenseDateValue(new Date());
    setAddFixedExpenseFrequencyValue(FIXED_EXPENSES_FREQUENCY_OPTIONS[2]);
    setAddFixedExpenseStatusValue(true);
  };

  const handleRemoveFixedExpense = async (id: string) => {
    await removeFixedExpense(id);
    const list = await listFixedExpenses();
    setFixedExpenses(list);
  };

  const handleUpdateFixedExpense = async () => {
    const selected = fixedExpenses.find(
      cat => cat.id === updateFixedExpenseIdValue,
    );
    const trimmedDescription = updateFixedExpenseDescriptionValue.trim();
    if (trimmedDescription === '') {
      return;
    }

    try {
      await updateFixedExpense({
        id: selected?.id ?? '',
        type: updateFixedExpenseTypeValue.value,
        description: trimmedDescription,
        value: updateFixedExpenseValueFloat,
        categoryId: updateFixedExpenseCategoryValue?.value ?? '',
        categoryName: updateFixedExpenseCategoryValue?.label ?? '',
        nextDate: updateFixedExpenseDateValue,
        frequency:
          updateFixedExpenseFrequencyValue?.value ??
          FIXED_EXPENSES_FREQUENCY_OPTIONS[2].value,
        status: updateFixedExpenseStatusValue,
      });
      handleCleanForm();
      listFixedExpenses().then(setFixedExpenses);
      setUpdateFixedExpenseVisible(false);
    } catch (error) {
      console.error('Erro ao atualizar gasto fixo:', error);
    }
  };

  const handleToggleFixedExpenseStatus = async (
    id: string,
    newStatus: boolean,
  ) => {
    try {
      const updated = await toggleFixedExpenseStatus(id, newStatus);
      setFixedExpenses(prev =>
        prev.map(item => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      console.error('Erro ao alternar status do gasto fixo:', error);
    }
  };

  //==================================================================================
  // Add Form States
  //==================================================================================

  // Type Form States
  const [addFixedExpenseTypeValue, setAddFixedExpenseTypeValue] = useState(
    FIXED_EXPENSES_TYPE_OPTIONS[0],
  );
  const openTypeSheet = () => {
    setAddFixedExpenseTypeDropdownVisible(prev => !prev);
  };
  const closeTypeSheet = () => {
    setAddFixedExpenseTypeDropdownVisible(false);
  };
  const handleTypeSelect = (
    item: (typeof FIXED_EXPENSES_TYPE_OPTIONS)[number],
  ) => {
    setAddFixedExpenseTypeValue(item);
    closeTypeSheet();
  };

  // Description Form State
  const [addFixedExpenseDescriptionValue, setAddFixedExpenseDescriptionValue] =
    useState('');

  // Value Form State
  const [addFixedExpenseValueText, setAddFixedExpenseValueText] = useState('');
  const [fixedExpenseValueFloat, setFixedExpenseValueFloat] = useState(0);
  const formatMoney = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  const onChangeValue = (text: string) => {
    setAddFixedExpenseValueText(text);
    const num = Number(text.replace(',', '.'));
    setFixedExpenseValueFloat(Number.isFinite(num) ? num : 0);
  };

  // Category Form States
  const [addFixedExpenseCategoryValue, setAddFixedExpenseCategoryValue] =
    useState<{ label: string; value: string } | null>(null);

  const openCategorySheet = () => {
    setAddFixedExpenseCategoryDropdownVisible(prev => !prev);
  };
  const closeCategorySheet = () => {
    setAddFixedExpenseCategoryDropdownVisible(false);
  };
  const handleCategorySelect = (
    item: (typeof fixedExpensesCategoryOptions)[number],
  ) => {
    setAddFixedExpenseCategoryValue(item);
    closeCategorySheet();
  };

  // Frequency Form States
  const [addFixedExpenseFrequencyValue, setAddFixedExpenseFrequencyValue] =
    useState<(typeof FIXED_EXPENSES_FREQUENCY_OPTIONS)[number]>(
      FIXED_EXPENSES_FREQUENCY_OPTIONS[2],
    );
  const openFrequencySheet = () => {
    setAddFixedExpenseFrequencyDropdownVisible(prev => !prev);
  };
  const closeFrequencySheet = () => {
    setAddFixedExpenseFrequencyDropdownVisible(false);
  };
  const handleFrequencySelect = (
    item: (typeof FIXED_EXPENSES_FREQUENCY_OPTIONS)[number],
  ) => {
    setAddFixedExpenseFrequencyValue(item);
    closeFrequencySheet();
  };

  // Date Form States
  const [addFixedExpenseDateValue, setAddFixedExpenseDateValue] = useState(
    new Date(),
  );
  const [addFixedExpenseStatusValue, setAddFixedExpenseStatusValue] =
    useState(true);
  const datePickerField = () => {
    const [show, setShow] = useState(false);

    const onChange = (_: any, selectedDate?: Date) => {
      setShow(false);
      if (selectedDate) setAddFixedExpenseDateValue(selectedDate);
    };

    const formatDate = (d: Date) => d.toLocaleDateString('pt-BR');

    return (
      <View style={styles.addFixedExpenseModalInputContainer}>
        <Text style={styles.addFixedExpenseModalInputLabel}>Data</Text>
        <View style={styles.addFixedExpenseModalInputButton}>
          <Text style={styles.addFixedExpenseModalInputButtonText}>
            {formatDate(addFixedExpenseDateValue)}
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
              value={addFixedExpenseDateValue}
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
  const [updateFixedExpenseIdValue, setUpdateFixedExpenseIdValue] =
    useState('');

  // Type Form States
  const [updateFixedExpenseTypeValue, setUpdateFixedExpenseTypeValue] =
    useState(FIXED_EXPENSES_TYPE_OPTIONS[0]);
  const openUpdateTypeSheet = () => {
    setUpdateFixedExpenseTypeDropdownVisible(prev => !prev);
  };
  const closeUpdateTypeSheet = () => {
    setUpdateFixedExpenseTypeDropdownVisible(false);
  };
  const handleUpdateTypeSelect = (
    item: (typeof FIXED_EXPENSES_TYPE_OPTIONS)[number],
  ) => {
    setUpdateFixedExpenseTypeValue(item);
    closeUpdateTypeSheet();
  };

  // Description Form State
  const [
    updateFixedExpenseDescriptionValue,
    setUpdateFixedExpenseDescriptionValue,
  ] = useState('');

  // Value Form State
  const [updateFixedExpenseValueText, setUpdateFixedExpenseValueText] =
    useState('');
  const [updateFixedExpenseValueFloat, setUpdateFixedExpenseValueFloat] =
    useState(0);
  const onChangeUpdateValue = (text: string) => {
    setUpdateFixedExpenseValueText(text);
    const num = Number(text.replace(',', '.'));
    setUpdateFixedExpenseValueFloat(Number.isFinite(num) ? num : 0);
  };

  // Category Form States
  const [updateFixedExpenseCategoryValue, setUpdateFixedExpenseCategoryValue] =
    useState<{ label: string; value: string } | null>(null);

  const openUpdateCategorySheet = () => {
    setUpdateFixedExpenseCategoryDropdownVisible(prev => !prev);
  };
  const closeUpdateCategorySheet = () => {
    setUpdateFixedExpenseCategoryDropdownVisible(false);
  };
  const handleUpdateCategorySelect = (
    item: (typeof fixedExpensesCategoryOptions)[number],
  ) => {
    setUpdateFixedExpenseCategoryValue(item);
    closeUpdateCategorySheet();
  };

  // Frequency Form States
  const [
    updateFixedExpenseFrequencyValue,
    setUpdateFixedExpenseFrequencyValue,
  ] = useState<(typeof FIXED_EXPENSES_FREQUENCY_OPTIONS)[number] | null>(
    FIXED_EXPENSES_FREQUENCY_OPTIONS[2],
  );
  const openUpdateFrequencySheet = () => {
    setUpdateFixedExpenseFrequencyDropdownVisible(prev => !prev);
  };
  const closeUpdateFrequencySheet = () => {
    setUpdateFixedExpenseFrequencyDropdownVisible(false);
  };
  const handleUpdateFrequencySelect = (
    item: (typeof FIXED_EXPENSES_FREQUENCY_OPTIONS)[number],
  ) => {
    setUpdateFixedExpenseFrequencyValue(item);
    closeUpdateFrequencySheet();
  };

  // Date Form States
  const [updateFixedExpenseDateValue, setUpdateFixedExpenseDateValue] =
    useState(new Date());
  const [updateFixedExpenseStatusValue, setUpdateFixedExpenseStatusValue] =
    useState(true);
  const updateDatePickerField = () => {
    const [show, setShow] = useState(false);

    const onChange = (_: any, selectedDate?: Date) => {
      setShow(false);
      if (selectedDate) setUpdateFixedExpenseDateValue(selectedDate);
    };

    const formatDate = (d: Date) => d.toLocaleDateString('pt-BR');

    return (
      <View style={styles.addFixedExpenseModalInputContainer}>
        <Text style={styles.addFixedExpenseModalInputLabel}>Data</Text>
        <View style={styles.addFixedExpenseModalInputButton}>
          <Text style={styles.addFixedExpenseModalInputButtonText}>
            {formatDate(updateFixedExpenseDateValue)}
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
              value={updateFixedExpenseDateValue}
              mode="date"
              display="calendar" // Andryoid
              onValueChange={onChange}
              maximumDate={new Date()}
            />
          )}
        </View>
      </View>
    );
  };

  //==================================================================================
  // Renders
  //==================================================================================

  const addFixedExpenseModal = () => {
    const optionsFiltered = fixedExpensesCategoryOptions.filter(
      (opt: any) => opt.type === addFixedExpenseTypeValue.value,
    );

    return (
      <Modal transparent visible={addFixedExpenseVisible} statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.addFixedExpenseModalContainer}>
            <Text style={styles.addFixedExpenseModalTitle}>
              Novo Gasto Fixo
            </Text>
            <Text style={styles.addFixedExpenseModalSubTitle}>
              Adicione um novo gasto fixo
            </Text>

            {/* Formulário para adicionar categoria */}
            <View style={styles.addFixedExpenseModalInputContainer}>
              <Text style={styles.addFixedExpenseModalInputLabel}>Tipo</Text>
              <TouchableOpacity
                style={styles.addFixedExpenseModalInputButton}
                onPress={openTypeSheet}
              >
                <Text style={styles.addFixedExpenseModalInputButtonText}>
                  {addFixedExpenseTypeValue.label}
                </Text>
                <MaterialDesignIcons
                  name={
                    addFixedExpenseTypeDropdownVisible
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {addFixedExpenseTypeDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {FIXED_EXPENSES_TYPE_OPTIONS.map(item => {
                    const isSelected =
                      item.value === addFixedExpenseTypeValue.value;

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

            <View style={styles.addFixedExpenseModalInputContainer}>
              <Text style={styles.addFixedExpenseModalInputLabel}>
                Descrição
              </Text>
              <TextInput
                style={styles.addFixedExpenseModalInputButton}
                placeholder="Ex: Salário, Aluguel, etc."
                placeholderTextColor={Colors.textSecondary}
                value={addFixedExpenseDescriptionValue}
                onChangeText={setAddFixedExpenseDescriptionValue}
              />
            </View>

            <View style={styles.addFixedExpenseModalInputContainer}>
              <Text style={styles.addFixedExpenseModalInputLabel}>Valor</Text>
              <TextInput
                style={styles.addFixedExpenseModalInputButton}
                placeholderTextColor={Colors.textSecondary}
                placeholder="0.00"
                value={addFixedExpenseValueText}
                onChangeText={onChangeValue}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.addFixedExpenseModalInputContainer}>
              <Text style={styles.addFixedExpenseModalInputLabel}>
                Categoria
              </Text>
              <TouchableOpacity
                style={styles.addFixedExpenseModalInputButton}
                onPress={openCategorySheet}
              >
                <Text
                  style={[
                    addFixedExpenseCategoryValue
                      ? styles.addFixedExpenseModalInputButtonText
                      : styles.addFixedExpenseModalInputButtonTextUnselected,
                  ]}
                >
                  {addFixedExpenseCategoryValue
                    ? addFixedExpenseCategoryValue.label
                    : 'Selecione uma categoria'}
                </Text>
                <MaterialDesignIcons
                  name={
                    addFixedExpenseCategoryDropdownVisible
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {addFixedExpenseCategoryDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {optionsFiltered.map(item => {
                    const isSelected =
                      addFixedExpenseCategoryValue &&
                      item.value === addFixedExpenseCategoryValue.value;

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

            <View style={styles.addFixedExpenseModalInputContainer}>
              <Text style={styles.addFixedExpenseModalInputLabel}>
                Frequencia
              </Text>
              <TouchableOpacity
                style={styles.addFixedExpenseModalInputButton}
                onPress={openFrequencySheet}
              >
                <Text
                  style={[
                    addFixedExpenseFrequencyValue
                      ? styles.addFixedExpenseModalInputButtonText
                      : styles.addFixedExpenseModalInputButtonTextUnselected,
                  ]}
                >
                  {addFixedExpenseFrequencyValue.label}
                </Text>
                <MaterialDesignIcons
                  name={
                    addFixedExpenseFrequencyDropdownVisible
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {addFixedExpenseFrequencyDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {FIXED_EXPENSES_FREQUENCY_OPTIONS.map(item => {
                    const isSelected =
                      addFixedExpenseFrequencyValue &&
                      item.value === addFixedExpenseFrequencyValue.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleFrequencySelect(item)}
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

            <View
              style={[
                styles.addFixedExpenseModalInputButton,
                { marginVertical: 8 },
              ]}
            >
              <View style={styles.statusRow}>
                <View>
                  <Text style={styles.addFixedExpenseModalInputLabel}>
                    Status
                  </Text>
                  <Text style={styles.statusValue}>
                    {addFixedExpenseStatusValue ? 'Ativo' : 'Inativo'}
                  </Text>
                </View>
                <Switch
                  value={addFixedExpenseStatusValue}
                  onValueChange={setAddFixedExpenseStatusValue}
                  trackColor={{
                    false: Colors.surfaceAlt,
                    true: Colors.primaryLight,
                  }}
                  thumbColor={
                    addFixedExpenseStatusValue
                      ? Colors.primary
                      : Colors.textSecondary
                  }
                />
              </View>
            </View>

            {/* Botão para adicionar gasto fixo */}
            <TouchableOpacity
              onPress={handleAddFixedExpense}
              style={[
                styles.addFixedExpenseModalButton,
                (addFixedExpenseDescriptionValue.trim() === '' ||
                  fixedExpenseValueFloat <= 0 ||
                  !addFixedExpenseCategoryValue) &&
                  styles.addFixedExpenseModalButtonDisabled,
              ]}
              disabled={
                addFixedExpenseDescriptionValue.trim() === '' ||
                fixedExpenseValueFloat <= 0 ||
                !addFixedExpenseCategoryValue
              }
            >
              <Text style={styles.addFixedExpenseModalButtonText}>
                Adicionar Gasto Fixo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setAddFixedExpenseVisible(false);
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

  const updateFixedExpenseModal = () => {
    const optionsFiltered = fixedExpensesCategoryOptions.filter(
      (opt: any) => opt.type === updateFixedExpenseTypeValue.value,
    );

    return (
      <Modal
        transparent
        visible={updateFixedExpenseVisible}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addFixedExpenseModalContainer}>
            <Text style={styles.addFixedExpenseModalTitle}>
              Editar Gasto Fixo
            </Text>
            <Text style={styles.addFixedExpenseModalSubTitle}>
              Edite os dados do gasto fixo
            </Text>

            {/* Formulário para editar gasto fixo */}
            <View style={styles.addFixedExpenseModalInputContainer}>
              <Text style={styles.addFixedExpenseModalInputLabel}>Tipo</Text>
              <TouchableOpacity
                style={styles.addFixedExpenseModalInputButton}
                onPress={openUpdateTypeSheet}
              >
                <Text style={styles.addFixedExpenseModalInputButtonText}>
                  {updateFixedExpenseTypeValue.label}
                </Text>
                <MaterialDesignIcons
                  name={
                    updateFixedExpenseTypeDropdownVisible
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {updateFixedExpenseTypeDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {FIXED_EXPENSES_TYPE_OPTIONS.map(item => {
                    const isSelected =
                      item.value === updateFixedExpenseTypeValue.value;

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

            <View style={styles.addFixedExpenseModalInputContainer}>
              <Text style={styles.addFixedExpenseModalInputLabel}>
                Descrição
              </Text>
              <TextInput
                style={styles.addFixedExpenseModalInputButton}
                placeholder="Ex: Salário, Aluguel, etc."
                placeholderTextColor={Colors.textSecondary}
                value={updateFixedExpenseDescriptionValue}
                onChangeText={setUpdateFixedExpenseDescriptionValue}
              />
            </View>

            <View style={styles.addFixedExpenseModalInputContainer}>
              <Text style={styles.addFixedExpenseModalInputLabel}>Valor</Text>
              <TextInput
                style={styles.addFixedExpenseModalInputButton}
                placeholderTextColor={Colors.textSecondary}
                placeholder="0.00"
                value={updateFixedExpenseValueText}
                onChangeText={onChangeUpdateValue}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.addFixedExpenseModalInputContainer}>
              <Text style={styles.addFixedExpenseModalInputLabel}>
                Categoria
              </Text>
              <TouchableOpacity
                style={styles.addFixedExpenseModalInputButton}
                onPress={openUpdateCategorySheet}
              >
                <Text
                  style={[
                    updateFixedExpenseCategoryValue
                      ? styles.addFixedExpenseModalInputButtonText
                      : styles.addFixedExpenseModalInputButtonTextUnselected,
                  ]}
                >
                  {updateFixedExpenseCategoryValue
                    ? updateFixedExpenseCategoryValue.label
                    : 'Selecione uma categoria'}
                </Text>
                <MaterialDesignIcons
                  name={
                    updateFixedExpenseCategoryDropdownVisible
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {updateFixedExpenseCategoryDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {optionsFiltered.map(item => {
                    const isSelected =
                      updateFixedExpenseCategoryValue &&
                      item.value === updateFixedExpenseCategoryValue.value;

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

            <View style={styles.addFixedExpenseModalInputContainer}>
              <Text style={styles.addFixedExpenseModalInputLabel}>
                Frequencia
              </Text>
              <TouchableOpacity
                style={styles.addFixedExpenseModalInputButton}
                onPress={openUpdateFrequencySheet}
              >
                <Text
                  style={[
                    updateFixedExpenseFrequencyValue
                      ? styles.addFixedExpenseModalInputButtonText
                      : styles.addFixedExpenseModalInputButtonTextUnselected,
                  ]}
                >
                  {updateFixedExpenseFrequencyValue
                    ? updateFixedExpenseFrequencyValue.label
                    : 'Selecione uma frequência'}
                </Text>
                <MaterialDesignIcons
                  name={
                    updateFixedExpenseFrequencyDropdownVisible
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {updateFixedExpenseFrequencyDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {FIXED_EXPENSES_FREQUENCY_OPTIONS.map(item => {
                    const isSelected =
                      updateFixedExpenseFrequencyValue &&
                      item.value === updateFixedExpenseFrequencyValue.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleUpdateFrequencySelect(item)}
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

            <View
              style={[
                styles.addFixedExpenseModalInputButton,
                { marginVertical: 8 },
              ]}
            >
              <View style={styles.statusRow}>
                <View>
                  <Text style={styles.addFixedExpenseModalInputLabel}>
                    Status
                  </Text>
                  <Text style={styles.statusValue}>
                    {updateFixedExpenseStatusValue ? 'Ativo' : 'Inativo'}
                  </Text>
                </View>
                <Switch
                  value={updateFixedExpenseStatusValue}
                  onValueChange={setUpdateFixedExpenseStatusValue}
                  trackColor={{
                    false: Colors.surfaceAlt,
                    true: Colors.primaryLight,
                  }}
                  thumbColor={
                    updateFixedExpenseStatusValue
                      ? Colors.primary
                      : Colors.textSecondary
                  }
                />
              </View>
            </View>

            {/* Botão para atualizar gasto fixo */}
            <TouchableOpacity
              onPress={handleUpdateFixedExpense}
              style={[
                styles.addFixedExpenseModalButton,
                (updateFixedExpenseDescriptionValue.trim() === '' ||
                  updateFixedExpenseValueFloat <= 0 ||
                  !updateFixedExpenseCategoryValue) &&
                  styles.addFixedExpenseModalButtonDisabled,
              ]}
              disabled={
                updateFixedExpenseDescriptionValue.trim() === '' ||
                updateFixedExpenseValueFloat <= 0 ||
                !updateFixedExpenseCategoryValue
              }
            >
              <Text style={styles.addFixedExpenseModalButtonText}>
                Atualizar Gasto Fixo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setUpdateFixedExpenseVisible(false);
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

  const renderMonthlySummary = () => {
    const totalActive = fixedExpenses.reduce((acc, expense) => {
      if (expense.status) {
        return expense.type === 'income'
          ? acc + expense.value
          : acc - expense.value;
      }
      return acc;
    }, 0);

    console.log('Total Ativo:', totalActive);

    return (
      <LinearGradient
        colors={[Colors.primaryLight, Colors.primary]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.monthlySummaryContainer}
      >
        <Text style={styles.monthlySummaryTitle}>Impacto Mensal</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginVertical: 12,
          }}
        >
          <Text style={styles.monthlySummaryText}>
            R$ {formatMoney(totalActive >= 0 ? totalActive : -totalActive)}
          </Text>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: Colors.overlayLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialDesignIcons
              name={'rotate-3d-variant'}
              size={28}
              color={Colors.surfaceAlt}
            />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.monthlySummarySubtitle}>
            {totalActive >= 0 ? 'Positivo' : 'Negativo'}
          </Text>
          <View
            style={{
              width: 2,
              height: 2,
              borderRadius: 100,
              backgroundColor: Colors.textInverted,
            }}
          />
          <Text style={styles.monthlySummarySubtitle}>
            {fixedExpenses.filter(exp => exp.status).length} ativos
          </Text>
        </View>
      </LinearGradient>
    );
  };

  const renderFixedExpenses = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      );
    }

    const active = fixedExpenses.filter(cat => cat.status === true);
    const inactive = fixedExpenses.filter(cat => cat.status === false);

    const sortedActive = [...active].sort((a, b) => {
      const aTime = new Date(a.nextDate).getTime();
      const bTime = new Date(b.nextDate).getTime();
      return bTime - aTime;
    });

    const sortedInactive = [...inactive].sort((a, b) => {
      const aTime = new Date(a.nextDate).getTime();
      const bTime = new Date(b.nextDate).getTime();
      return bTime - aTime;
    });

    return (
      <View style={styles.fixedExpensesContainer}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              marginBottom: 12,
            }}
          >
            <Text style={styles.fixedExpensesTypeTitle}>Ativos</Text>
            <Text style={styles.fixedExpensesTypeTitle}>({active.length})</Text>
          </View>
          {sortedActive.length === 0 && (
            <Shadow
              containerStyle={styles.emptyShadowContainer}
              style={styles.emptyShadow}
              distance={3}
              startColor="rgba(0, 0, 0, 0.05)"
              offset={[0, 3]}
            >
              <View style={styles.emptyContainer}>
                <MaterialDesignIcons
                  name="rotate-3d-variant"
                  size={48}
                  color={Colors.gray}
                />
                <Text style={styles.emptyTextTitle}>
                  Nenhum gasto fixo ativo
                </Text>
                <Text style={styles.emptyTextSubtitle}>
                  Toque no + para adicionar
                </Text>
              </View>
            </Shadow>
          )}
          <FlatList
            data={sortedActive}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Shadow
                containerStyle={styles.fixedExpenseShadowContainer}
                style={styles.fixedExpenseShadow}
                distance={3}
                startColor="rgba(0, 0, 0, 0.05)"
                offset={[0, 3]}
              >
                <View style={styles.fixedExpenseContainer}>
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
                        style={{
                          color: Colors.textPrimary,
                          fontWeight: 'bold',
                        }}
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
                          {item.frequency === 'daily'
                            ? 'Diário'
                            : item.frequency === 'weekly'
                            ? 'Semanal'
                            : item.frequency === 'monthly'
                            ? 'Mensal'
                            : 'Anual'}
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
                          {item.categoryName}
                        </Text>
                      </View>
                      <Text
                        style={{ color: Colors.textSecondary, fontSize: 12 }}
                      >
                        Próxima:{' '}
                        {new Date(item.nextDate).toLocaleDateString('pt-BR')}
                      </Text>
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
                          item.type === 'income'
                            ? Colors.success
                            : Colors.error,
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
                      <Switch
                        value={item.status ?? true}
                        onValueChange={newValue =>
                          handleToggleFixedExpenseStatus(item.id, newValue)
                        }
                        trackColor={{
                          false: Colors.surfaceAlt,
                          true: Colors.primaryLight,
                        }}
                        thumbColor={
                          item.status ?? true
                            ? Colors.primary
                            : Colors.textSecondary
                        }
                      />
                      <TouchableOpacity
                        onPress={() => {
                          setUpdateFixedExpenseVisible(true);
                          setUpdateFixedExpenseIdValue(item.id);
                          setUpdateFixedExpenseDescriptionValue(
                            item.description,
                          );
                          setUpdateFixedExpenseValueText(item.value.toString());
                          setUpdateFixedExpenseValueFloat(item.value);
                          setUpdateFixedExpenseTypeValue(
                            FIXED_EXPENSES_TYPE_OPTIONS.find(
                              opt => opt.value === item.type,
                            ) ?? FIXED_EXPENSES_TYPE_OPTIONS[0],
                          );
                          setUpdateFixedExpenseCategoryValue({
                            label: item.categoryName,
                            value: item.categoryId,
                          });
                          setUpdateFixedExpenseDateValue(
                            new Date(item.nextDate),
                          );
                          setUpdateFixedExpenseFrequencyValue(
                            FIXED_EXPENSES_FREQUENCY_OPTIONS.find(
                              opt => opt.value === item.frequency,
                            ) ?? FIXED_EXPENSES_FREQUENCY_OPTIONS[0],
                          );
                          setUpdateFixedExpenseStatusValue(item.status ?? true);
                        }}
                      >
                        <MaterialDesignIcons
                          name="pencil-outline"
                          size={16}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveFixedExpense(item.id)}
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
        {sortedInactive.length > 0 && (
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
                marginBottom: 12,
              }}
            >
              <Text style={styles.fixedExpensesTypeTitle}>Inativos</Text>
              <Text style={styles.fixedExpensesTypeTitle}>
                ({inactive.length})
              </Text>
            </View>
            <FlatList
              data={sortedInactive}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Shadow
                  containerStyle={styles.fixedExpenseShadowContainer}
                  style={styles.fixedExpenseShadow}
                  distance={3}
                  startColor="rgba(0, 0, 0, 0.05)"
                  offset={[0, 3]}
                >
                  <View style={styles.fixedExpenseContainer}>
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
                          backgroundColor: Colors.surfaceAlt,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MaterialDesignIcons
                          name={'rotate-3d-variant'}
                          size={16}
                          color={Colors.textSecondary}
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
                          style={{
                            color: Colors.textPrimary,
                            fontWeight: 'bold',
                          }}
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
                            style={{
                              color: Colors.textSecondary,
                              fontSize: 12,
                            }}
                          >
                            {item.frequency === 'daily'
                              ? 'Diário'
                              : item.frequency === 'weekly'
                              ? 'Semanal'
                              : item.frequency === 'monthly'
                              ? 'Mensal'
                              : 'Anual'}
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
                            style={{
                              color: Colors.textSecondary,
                              fontSize: 12,
                            }}
                          >
                            {item.categoryName}
                          </Text>
                        </View>
                        <Text
                          style={{ color: Colors.textSecondary, fontSize: 12 }}
                        >
                          Próxima:{' '}
                          {new Date(item.nextDate).toLocaleDateString('pt-BR')}
                        </Text>
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
                          color: Colors.textSecondary,
                          fontWeight: 'bold',
                          marginTop: 4,
                        }}
                      >
                        R$ {formatMoney(item.value)}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <Switch
                          value={item.status ?? true}
                          onValueChange={newValue =>
                            handleToggleFixedExpenseStatus(item.id, newValue)
                          }
                          trackColor={{
                            false: Colors.surfaceAlt,
                            true: Colors.primaryLight,
                          }}
                          thumbColor={
                            item.status ?? true
                              ? Colors.primary
                              : Colors.textSecondary
                          }
                        />
                        <TouchableOpacity
                          onPress={() => {
                            setUpdateFixedExpenseVisible(true);
                            setUpdateFixedExpenseIdValue(item.id);
                            setUpdateFixedExpenseDescriptionValue(
                              item.description,
                            );
                            setUpdateFixedExpenseValueText(
                              item.value.toString(),
                            );
                            setUpdateFixedExpenseValueFloat(item.value);
                            setUpdateFixedExpenseTypeValue(
                              FIXED_EXPENSES_TYPE_OPTIONS.find(
                                opt => opt.value === item.type,
                              ) ?? FIXED_EXPENSES_TYPE_OPTIONS[0],
                            );
                            setUpdateFixedExpenseCategoryValue({
                              label: item.categoryName,
                              value: item.categoryId,
                            });
                            setUpdateFixedExpenseDateValue(
                              new Date(item.nextDate),
                            );
                            setUpdateFixedExpenseFrequencyValue(
                              FIXED_EXPENSES_FREQUENCY_OPTIONS.find(
                                opt => opt.value === item.frequency,
                              ) ?? FIXED_EXPENSES_FREQUENCY_OPTIONS[0],
                            );
                            setUpdateFixedExpenseStatusValue(
                              item.status ?? true,
                            );
                          }}
                        >
                          <MaterialDesignIcons
                            name="pencil-outline"
                            size={16}
                            color={Colors.textSecondary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRemoveFixedExpense(item.id)}
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
        )}
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
          <Text style={styles.title}>Gastos Fixos</Text>
          <Text style={styles.subtitle}>Gerencie seus gastos fixos</Text>
        </View>
        <TouchableOpacity
          onPress={() => setAddFixedExpenseVisible(true)}
          style={styles.addFixedExpenseButton}
        >
          <MaterialDesignIcons name="plus" size={24} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      {!isLoading && renderMonthlySummary()}
      {renderFixedExpenses()}

      {addFixedExpenseModal()}
      {updateFixedExpenseModal()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
paddingTop: 16,
paddingBottom: 32,
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
  addFixedExpenseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFixedExpenseModalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFixedExpenseModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addFixedExpenseModalSubTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  addFixedExpenseModalButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  addFixedExpenseModalButtonDisabled: {
    backgroundColor: Colors.primaryLight,
  },
  addFixedExpenseModalButtonText: {
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
  addFixedExpenseModalInputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  addFixedExpenseModalInputLabel: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  addFixedExpenseModalInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceAlt,
  },
  addFixedExpenseModalInputButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  addFixedExpenseModalInputButtonTextUnselected: {
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statusValue: {
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

  // Fixed Expenses Styles
  fixedExpensesContainer: {
    flex: 1,
    width: '100%',
  },
  fixedExpenseShadowContainer: {
    width: '100%',
    marginBottom: 12,
  },
  fixedExpenseShadow: {
    borderRadius: 8,
  },
  fixedExpenseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
  fixedExpensesTypeTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
  },

  emptyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 8,
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
  emptyShadowContainer: {
    width: '100%',
    marginBottom: 12,
  },
  emptyShadow: {
    borderRadius: 8,
    width: '100%',
  },
  emptyTextTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyTextSubtitle: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },

  //Monthly Summary Styles
  monthlySummaryContainer: {
    padding: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  monthlySummaryText: {
    fontSize: 28,
    color: Colors.surface,
    fontWeight: 'bold',
  },
  monthlySummaryTitle: {
    fontSize: 13,
    color: Colors.textInverted,
    fontWeight: 'bold',
  },
  monthlySummarySubtitle: {
    fontSize: 12,
    color: Colors.textInverted,
  },
});
