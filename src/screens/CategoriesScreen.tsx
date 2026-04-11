import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../theme';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import React, { use, useCallback, useEffect, useState } from 'react';
import {
  listCategories,
  saveCategory,
  Category,
  removeCategory,
  updateCategory,
} from '../services/categoryService';
import { Shadow } from 'react-native-shadow-2';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

//==================================================================================
// Types
//==================================================================================

type MaterialIconName = React.ComponentProps<
  typeof MaterialDesignIcons
>['name'];

//==================================================================================
// Constants
//==================================================================================

const CATEGORY_TYPE_OPTIONS = [
  { label: 'Saída', value: 'expense' },
  { label: 'Entrada', value: 'income' },
];

const CATEGORY_ICON_OPTIONS: Array<{ label: string; value: MaterialIconName }> =
  [
    { label: 'UtensilsCrossed', value: 'silverware-fork-knife' },
    { label: 'Car', value: 'car-outline' },
    { label: 'Home', value: 'home-outline' },
    { label: 'Heart', value: 'heart-outline' },
    { label: 'GraduationCap', value: 'school-outline' },
    { label: 'Gamepad2', value: 'gamepad-variant-outline' },
    { label: 'ShoppingBag', value: 'shopping-outline' },
    { label: 'Receipt', value: 'receipt-text-outline' },
    { label: 'Wallet', value: 'wallet-outline' },
    { label: 'Briefcase', value: 'briefcase-outline' },
    { label: 'TrendingUp', value: 'trending-up' },
    { label: 'DollarSign', value: 'currency-usd' },
    { label: 'Coffee', value: 'coffee' },
    { label: 'Smartphone', value: 'cellphone' },
    { label: 'Zap', value: 'flash-outline' },
    { label: 'Film', value: 'filmstrip' },
    { label: 'Music', value: 'music-note-outline' },
    { label: 'Shirt', value: 'tshirt-crew-outline' },
    { label: 'Plane', value: 'airplane' },
    { label: 'Gift', value: 'gift-outline' },
  ];

const CATEGORY_COLOR_OPTIONS = [
  { label: 'Vermelho', value: '#ef4444' },
  { label: 'Laranja', value: '#f59e0b' },
  { label: 'Roxo', value: '#7c4ce4' },
  { label: 'Rosa', value: '#ec4899' },
  { label: 'Ciano', value: '#06b6d4' },
  { label: 'Laranja Escuro', value: '#f97316' },
  { label: 'Roxo Claro', value: '#a855f7' },
  { label: 'Cinza', value: '#64748b' },
  { label: 'Verde', value: '#10b981' },
  { label: 'Azul', value: '#3b82f6' },
  { label: 'Verde Água', value: '#14b8a6' },
  { label: 'Lima', value: '#84cc16' },
];

const hexToRgba = (hex: string, alpha = 1) => {
  const cleanHex = hex.replace('#', '');
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map(char => char + char)
          .join('')
      : cleanHex;

  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

//==================================================================================
// Main Component
//==================================================================================

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [addCategoryVisible, setAddCategoryVisible] = useState(false);
  const [addTypeDropdownVisible, setAddTypeDropdownVisible] = useState(false);
  const [addIconDropdownVisible, setAddIconDropdownVisible] = useState(false);
  const [addColorDropdownVisible, setAddColorDropdownVisible] = useState(false);
  const [updateCategoryVisible, setUpdateCategoryVisible] = useState(false);
  const [updateTypeDropdownVisible, setUpdateTypeDropdownVisible] =
    useState(false);
  const [updateIconDropdownVisible, setUpdateIconDropdownVisible] =
    useState(false);
  const [updateColorDropdownVisible, setUpdateColorDropdownVisible] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const list = await listCategories();
        setCategories(list);
      };
      load();
    }, []),
  );

  //==================================================================================
  // Handlers
  //==================================================================================

  const handleAddCategory = async () => {
    const trimmedName = addCategoryNameValue.trim();
    if (trimmedName === '') {
      return;
    }

    try {
      await saveCategory({
        name: trimmedName,
        type: addCategoryTypeValue.value,
        icon: addCategoryIconValue.value,
        color: addCategoryColorValue.value,
      });
      listCategories().then(setCategories);
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
    }
    handleCleanForm();
    setAddCategoryVisible(false);
  };

  const handleCleanForm = () => {
    setAddCategoryTypeValue(CATEGORY_TYPE_OPTIONS[0]);
    setAddCategoryNameValue('');
    setAddCategoryIconValue(CATEGORY_ICON_OPTIONS[0]);
    setAddCategoryColorValue(CATEGORY_COLOR_OPTIONS[0]);
  };

  const handleRemoveCategory = async (id: string) => {
    await removeCategory(id);
    const updated = categories.filter(cat => cat.id !== id);
    setCategories(updated);
  };

  const handleUpdateCategory = async () => {
    const selected = categories.find(cat => cat.id === updateCategoryIdValue);
    const trimmedName = updateCategoryNameValue.trim();
    if (trimmedName === '') {
      return;
    }

    try {
      await updateCategory({
        id: selected?.id ?? '',
        name: trimmedName,
        type: updateCategoryTypeValue.value,
        icon: updateCategoryIconValue.value,
        color: updateCategoryColorValue.value,
      });
      handleCleanForm();
      listCategories().then(setCategories);
      setUpdateCategoryVisible(false);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
    }
  };

  //==================================================================================
  // Add Form States
  //==================================================================================

  // Type Form States
  const [addCategoryTypeValue, setAddCategoryTypeValue] = useState(
    CATEGORY_TYPE_OPTIONS[0],
  );
  const openTypeSheet = () => {
    setAddTypeDropdownVisible(prev => !prev);
  };
  const closeTypeSheet = () => {
    setAddTypeDropdownVisible(false);
  };
  const handleTypeSelect = (item: (typeof CATEGORY_TYPE_OPTIONS)[number]) => {
    setAddCategoryTypeValue(item);
    closeTypeSheet();
  };

  // Name Form State
  const [addCategoryNameValue, setAddCategoryNameValue] = useState('');

  // Icon Form States
  const [addCategoryIconValue, setAddCategoryIconValue] = useState(
    CATEGORY_ICON_OPTIONS[0],
  );
  const openIconSheet = () => {
    setAddIconDropdownVisible(prev => !prev);
  };
  const closeIconSheet = () => {
    setAddIconDropdownVisible(false);
  };
  const handleIconSelect = (item: (typeof CATEGORY_ICON_OPTIONS)[number]) => {
    setAddCategoryIconValue(item);
    closeIconSheet();
  };

  // Color Form States
  const [addCategoryColorValue, setAddCategoryColorValue] = useState(
    CATEGORY_COLOR_OPTIONS[0],
  );
  const openColorSheet = () => {
    setAddColorDropdownVisible(prev => !prev);
  };
  const closeColorSheet = () => {
    setAddColorDropdownVisible(false);
  };
  const handleColorSelect = (item: (typeof CATEGORY_COLOR_OPTIONS)[number]) => {
    setAddCategoryColorValue(item);
    closeColorSheet();
  };

  //==================================================================================
  // Update Form States
  //==================================================================================
  const [updateCategoryIdValue, setUpdateCategoryIdValue] = useState('');

  // Type Form States
  const [updateCategoryTypeValue, setUpdateCategoryTypeValue] = useState(
    CATEGORY_TYPE_OPTIONS[0],
  );
  const openUpdateTypeSheet = () => {
    setUpdateTypeDropdownVisible(prev => !prev);
  };
  const closeUpdateTypeSheet = () => {
    setUpdateTypeDropdownVisible(false);
  };
  const handleUpdateTypeSelect = (
    item: (typeof CATEGORY_TYPE_OPTIONS)[number],
  ) => {
    setUpdateCategoryTypeValue(item);
    closeUpdateTypeSheet();
  };

  // Name Form State
  const [updateCategoryNameValue, setUpdateCategoryNameValue] = useState('');

  // Icon Form States
  const [updateCategoryIconValue, setUpdateCategoryIconValue] = useState(
    CATEGORY_ICON_OPTIONS[0],
  );
  const openUpdateIconSheet = () => {
    setUpdateIconDropdownVisible(prev => !prev);
  };
  const closeUpdateIconSheet = () => {
    setUpdateIconDropdownVisible(false);
  };
  const handleUpdateIconSelect = (
    item: (typeof CATEGORY_ICON_OPTIONS)[number],
  ) => {
    setUpdateCategoryIconValue(item);
    closeUpdateIconSheet();
  };

  // Color Form States
  const [updateCategoryColorValue, setUpdateCategoryColorValue] = useState(
    CATEGORY_COLOR_OPTIONS[0],
  );
  const openUpdateColorSheet = () => {
    setUpdateColorDropdownVisible(prev => !prev);
  };
  const closeUpdateColorSheet = () => {
    setUpdateColorDropdownVisible(false);
  };
  const handleUpdateColorSelect = (
    item: (typeof CATEGORY_COLOR_OPTIONS)[number],
  ) => {
    setUpdateCategoryColorValue(item);
    closeUpdateColorSheet();
  };

  //==================================================================================
  // Render States
  //==================================================================================

  const addCategoryModal = () => {
    const selectedColor = addCategoryColorValue.value;
    const previewBg = hexToRgba(selectedColor, 0.3);

    return (
      <Modal transparent visible={addCategoryVisible} statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.addCategoryModalContainer}>
            <Text style={styles.addCategoryModalTitle}>Nova Categoria</Text>
            <Text style={styles.addCategoryModalSubTitle}>
              Crie uma nova categoria personalizada
            </Text>

            {/* Formulário para adicionar categoria */}
            <View style={styles.addCategoryModalInputContainer}>
              <Text style={styles.addCategoryModalInputLabel}>Tipo</Text>
              <TouchableOpacity
                style={styles.addCategoryModalInputButton}
                onPress={openTypeSheet}
              >
                <Text style={styles.addCategoryModalInputButtonText}>
                  {addCategoryTypeValue.label}
                </Text>
                <MaterialDesignIcons
                  name={addTypeDropdownVisible ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {addTypeDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {CATEGORY_TYPE_OPTIONS.map(item => {
                    const isSelected =
                      item.value === addCategoryTypeValue.value;

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

            <View style={styles.addCategoryModalInputContainer}>
              <Text style={styles.addCategoryModalInputLabel}>
                Nome da Categoria
              </Text>
              <TextInput
                style={styles.addCategoryModalInputButton}
                placeholder="Ex: Restaurante"
                placeholderTextColor={Colors.textSecondary}
                value={addCategoryNameValue}
                onChangeText={setAddCategoryNameValue}
              />
            </View>

            <View style={styles.addCategoryModalInputContainer}>
              <Text style={styles.addCategoryModalInputLabel}>Ícone</Text>
              <TouchableOpacity
                style={styles.addCategoryModalInputButton}
                onPress={openIconSheet}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <MaterialDesignIcons
                    name={addCategoryIconValue.value}
                    size={16}
                    color={Colors.textPrimary}
                  />
                  <Text style={styles.addCategoryModalInputButtonText}>
                    {addCategoryIconValue.label}
                  </Text>
                </View>
                <MaterialDesignIcons
                  name={addIconDropdownVisible ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {addIconDropdownVisible && (
                <ScrollView style={styles.inlineDropdownContainer}>
                  {CATEGORY_ICON_OPTIONS.map(item => {
                    const isSelected =
                      item.value === addCategoryIconValue.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleIconSelect(item)}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <MaterialDesignIcons
                            name={item.value}
                            size={16}
                            color={
                              isSelected
                                ? Colors.textPrimary
                                : Colors.textSecondary
                            }
                          />
                          <Text
                            style={[
                              styles.inlineDropdownOptionText,
                              isSelected &&
                                styles.inlineDropdownOptionTextSelected,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                        {isSelected && (
                          <MaterialDesignIcons
                            name="check"
                            size={16}
                            color={Colors.textPrimary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            <View style={styles.addCategoryModalInputContainer}>
              <Text style={styles.addCategoryModalInputLabel}>Cor</Text>
              <TouchableOpacity
                style={styles.addCategoryModalInputButton}
                onPress={openColorSheet}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: selectedColor,
                    }}
                  />
                  <Text style={styles.addCategoryModalInputButtonText}>
                    {addCategoryColorValue.label}
                  </Text>
                </View>
                <MaterialDesignIcons
                  name={addColorDropdownVisible ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {addColorDropdownVisible && (
                <ScrollView style={styles.inlineDropdownContainer}>
                  {CATEGORY_COLOR_OPTIONS.map(item => {
                    const isSelected =
                      item.value === addCategoryColorValue.value;
                    const itemColor = item.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleColorSelect(item)}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 6,
                              backgroundColor: itemColor,
                            }}
                          />
                          <Text
                            style={[
                              styles.inlineDropdownOptionText,
                              isSelected &&
                                styles.inlineDropdownOptionTextSelected,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                        {isSelected && (
                          <MaterialDesignIcons
                            name="check"
                            size={16}
                            color={Colors.textPrimary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            <View style={styles.previewContainer}>
              <Text style={styles.addCategoryModalInputLabel}>Prévia:</Text>
              <View style={styles.categoryPreview}>
                <View
                  style={{
                    marginRight: 6,
                    borderRadius: 100,
                    padding: 8,
                    backgroundColor: previewBg,
                  }}
                >
                  <MaterialDesignIcons
                    name={addCategoryIconValue.value}
                    size={16}
                    color={selectedColor}
                  />
                </View>
                {addCategoryNameValue !== '' ? (
                  <Text
                    style={{
                      color: Colors.textPrimary,
                      fontSize: 14,
                      fontWeight: '500',
                    }}
                  >
                    {addCategoryNameValue}
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: Colors.textSecondary,
                      fontSize: 14,
                      fontWeight: '500',
                    }}
                  >
                    Nome da Categoria
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleAddCategory()}
              style={[
                styles.addCategoryModalButton,
                addCategoryNameValue.trim() === '' &&
                  styles.addCategoryModalButtonDisabled,
              ]}
              disabled={addCategoryNameValue.trim() === ''}
            >
              <Text style={styles.addCategoryModalButtonText}>
                Adicionar Categoria
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setAddCategoryVisible(false);
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

  const updateCategoryModal = () => {
    const selectedUpdatedColor = updateCategoryColorValue.value;
    const previewBg = hexToRgba(selectedUpdatedColor, 0.3);

    return (
      <Modal transparent visible={updateCategoryVisible} statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.addCategoryModalContainer}>
            <Text style={styles.addCategoryModalTitle}>Editar Categoria</Text>
            <Text style={styles.addCategoryModalSubTitle}>
              Edite os detalhes da categoria
            </Text>

            {/* Formulário para adicionar categoria */}
            <View style={styles.addCategoryModalInputContainer}>
              <Text style={styles.addCategoryModalInputLabel}>Tipo</Text>
              <TouchableOpacity
                style={styles.addCategoryModalInputButton}
                onPress={openUpdateTypeSheet}
              >
                <Text style={styles.addCategoryModalInputButtonText}>
                  {updateCategoryTypeValue.label}
                </Text>
                <MaterialDesignIcons
                  name={
                    updateTypeDropdownVisible ? 'chevron-up' : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {updateTypeDropdownVisible && (
                <View style={styles.inlineDropdownContainer}>
                  {CATEGORY_TYPE_OPTIONS.map(item => {
                    const isSelected =
                      item.value === updateCategoryTypeValue.value;

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

            <View style={styles.addCategoryModalInputContainer}>
              <Text style={styles.addCategoryModalInputLabel}>
                Nome da Categoria
              </Text>
              <TextInput
                style={styles.addCategoryModalInputButton}
                placeholder="Ex: Restaurante"
                placeholderTextColor={Colors.textSecondary}
                value={updateCategoryNameValue}
                onChangeText={setUpdateCategoryNameValue}
              />
            </View>

            <View style={styles.addCategoryModalInputContainer}>
              <Text style={styles.addCategoryModalInputLabel}>Ícone</Text>
              <TouchableOpacity
                style={styles.addCategoryModalInputButton}
                onPress={openUpdateIconSheet}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <MaterialDesignIcons
                    name={updateCategoryIconValue.value}
                    size={16}
                    color={Colors.textPrimary}
                  />
                  <Text style={styles.addCategoryModalInputButtonText}>
                    {updateCategoryIconValue.label}
                  </Text>
                </View>
                <MaterialDesignIcons
                  name={
                    updateIconDropdownVisible ? 'chevron-up' : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {updateIconDropdownVisible && (
                <ScrollView style={styles.inlineDropdownContainer}>
                  {CATEGORY_ICON_OPTIONS.map(item => {
                    const isSelected =
                      item.value === updateCategoryIconValue.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleUpdateIconSelect(item)}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <MaterialDesignIcons
                            name={item.value}
                            size={16}
                            color={
                              isSelected
                                ? Colors.textPrimary
                                : Colors.textSecondary
                            }
                          />
                          <Text
                            style={[
                              styles.inlineDropdownOptionText,
                              isSelected &&
                                styles.inlineDropdownOptionTextSelected,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                        {isSelected && (
                          <MaterialDesignIcons
                            name="check"
                            size={16}
                            color={Colors.textPrimary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            <View style={styles.addCategoryModalInputContainer}>
              <Text style={styles.addCategoryModalInputLabel}>Cor</Text>
              <TouchableOpacity
                style={styles.addCategoryModalInputButton}
                onPress={openUpdateColorSheet}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: selectedUpdatedColor,
                    }}
                  />
                  <Text style={styles.addCategoryModalInputButtonText}>
                    {updateCategoryColorValue.label}
                  </Text>
                </View>
                <MaterialDesignIcons
                  name={
                    updateColorDropdownVisible ? 'chevron-up' : 'chevron-down'
                  }
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {updateColorDropdownVisible && (
                <ScrollView style={styles.inlineDropdownContainer}>
                  {CATEGORY_COLOR_OPTIONS.map(item => {
                    const isSelected =
                      item.value === updateCategoryColorValue.value;
                    const itemColor = item.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.inlineDropdownOption,
                          isSelected && styles.inlineDropdownOptionSelected,
                        ]}
                        onPress={() => handleUpdateColorSelect(item)}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 6,
                              backgroundColor: itemColor,
                            }}
                          />
                          <Text
                            style={[
                              styles.inlineDropdownOptionText,
                              isSelected &&
                                styles.inlineDropdownOptionTextSelected,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                        {isSelected && (
                          <MaterialDesignIcons
                            name="check"
                            size={16}
                            color={Colors.textPrimary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            <View style={styles.previewContainer}>
              <Text style={styles.addCategoryModalInputLabel}>Prévia:</Text>
              <View style={styles.categoryPreview}>
                <View
                  style={{
                    marginRight: 6,
                    borderRadius: 100,
                    padding: 8,
                    backgroundColor: previewBg,
                  }}
                >
                  <MaterialDesignIcons
                    name={updateCategoryIconValue.value}
                    size={16}
                    color={selectedUpdatedColor}
                  />
                </View>
                {updateCategoryNameValue !== '' ? (
                  <Text
                    style={{
                      color: Colors.textPrimary,
                      fontSize: 14,
                      fontWeight: '500',
                    }}
                  >
                    {updateCategoryNameValue}
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: Colors.textSecondary,
                      fontSize: 14,
                      fontWeight: '500',
                    }}
                  >
                    Nome da Categoria
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleUpdateCategory()}
              style={[
                styles.addCategoryModalButton,
                updateCategoryNameValue.trim() === '' &&
                  styles.addCategoryModalButtonDisabled,
              ]}
              disabled={updateCategoryNameValue.trim() === ''}
            >
              <Text style={styles.addCategoryModalButtonText}>
                Atualizar Categoria
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setUpdateCategoryVisible(false);
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

  const renderCategories = () => {
    const incomes = categories.filter(cat => cat.type === 'income');
    const expenses = categories.filter(cat => cat.type === 'expense');
    return (
      <View style={styles.categoriesContainer}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              marginBottom: 12,
            }}
          >
            <Text style={styles.categoryTypeTitle}>Saídas</Text>
            <Text style={styles.categoryTypeTitle}>({expenses.length})</Text>
          </View>
          {expenses.length === 0 && (
            <Shadow
              containerStyle={styles.emptyShadowContainer}
              style={styles.emptyShadow}
              distance={3}
              startColor="rgba(0, 0, 0, 0.05)"
              offset={[0, 3]}
            >
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTextTitle}>
                  Nenhuma categoria adicionada
                </Text>
                <Text style={styles.emptyTextSubtitle}>
                  Toque no + para adicionar
                </Text>
              </View>
            </Shadow>
          )}
          <FlatList
            style={{ overflow: 'visible' }}
            data={expenses}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Shadow
                containerStyle={styles.categoryShadowContainer}
                style={styles.categoryShadow}
                distance={3}
                startColor="rgba(0, 0, 0, 0.05)"
                offset={[0, 3]}
              >
                <View style={styles.categoryContainer}>
                  <View style={styles.categoryHeader}>
                    <View
                      style={[
                        styles.categoryIconContainer,
                        {
                          backgroundColor: hexToRgba(item.color, 0.3),
                          borderRadius: 100,
                        },
                      ]}
                    >
                      <MaterialDesignIcons
                        name={item.icon}
                        size={16}
                        color={item.color}
                      />
                    </View>
                    <View style={styles.categoryActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setUpdateCategoryVisible(true);
                          setUpdateCategoryIdValue(item.id);
                          setUpdateCategoryNameValue(item.name);
                          setUpdateCategoryTypeValue(
                            CATEGORY_TYPE_OPTIONS.find(
                              opt => opt.value === item.type,
                            ) || CATEGORY_TYPE_OPTIONS[0],
                          );
                          setUpdateCategoryIconValue(
                            CATEGORY_ICON_OPTIONS.find(
                              opt => opt.value === item.icon,
                            ) || CATEGORY_ICON_OPTIONS[0],
                          );
                          setUpdateCategoryColorValue(
                            CATEGORY_COLOR_OPTIONS.find(
                              opt => opt.value === item.color,
                            ) || CATEGORY_COLOR_OPTIONS[0],
                          );
                        }}
                        style={styles.editCategoryButton}
                      >
                        <MaterialDesignIcons
                          name="pencil-outline"
                          size={16}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveCategory(item.id)}
                        style={styles.removeCategoryButton}
                      >
                        <MaterialDesignIcons
                          name="trash-can-outline"
                          size={16}
                          color={Colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.categoryName}>{item.name}</Text>
                  </View>
                </View>
              </Shadow>
            )}
          />
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              marginBottom: 12,
            }}
          >
            <Text style={styles.categoryTypeTitle}>Entradas</Text>
            <Text style={styles.categoryTypeTitle}>({incomes.length})</Text>
          </View>
          {incomes.length === 0 && (
            <Shadow
              containerStyle={styles.emptyShadowContainer}
              style={styles.emptyShadow}
              distance={3}
              startColor="rgba(0, 0, 0, 0.05)"
              offset={[0, 3]}
            >
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTextTitle}>
                  Nenhuma categoria adicionada
                </Text>
                <Text style={styles.emptyTextSubtitle}>
                  Toque no + para adicionar
                </Text>
              </View>
            </Shadow>
          )}
          <FlatList
            style={{ overflow: 'visible' }}
            data={incomes}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Shadow
                containerStyle={styles.categoryShadowContainer}
                style={styles.categoryShadow}
                distance={3}
                startColor="rgba(0, 0, 0, 0.05)"
                offset={[0, 3]}
              >
                <View style={styles.categoryContainer}>
                  <View style={styles.categoryHeader}>
                    <View
                      style={[
                        styles.categoryIconContainer,
                        {
                          backgroundColor: hexToRgba(item.color, 0.3),
                          borderRadius: 100,
                        },
                      ]}
                    >
                      <MaterialDesignIcons
                        name={item.icon}
                        size={16}
                        color={item.color}
                      />
                    </View>
                    <View style={styles.categoryActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setUpdateCategoryVisible(true);
                          setUpdateCategoryIdValue(item.id);
                          setUpdateCategoryNameValue(item.name);
                          setUpdateCategoryTypeValue(
                            CATEGORY_TYPE_OPTIONS.find(
                              opt => opt.value === item.type,
                            ) || CATEGORY_TYPE_OPTIONS[0],
                          );
                          setUpdateCategoryIconValue(
                            CATEGORY_ICON_OPTIONS.find(
                              opt => opt.value === item.icon,
                            ) || CATEGORY_ICON_OPTIONS[0],
                          );
                          setUpdateCategoryColorValue(
                            CATEGORY_COLOR_OPTIONS.find(
                              opt => opt.value === item.color,
                            ) || CATEGORY_COLOR_OPTIONS[0],
                          );
                        }}
                        style={styles.editCategoryButton}
                      >
                        <MaterialDesignIcons
                          name="pencil"
                          size={16}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveCategory(item.id)}
                        style={styles.removeCategoryButton}
                      >
                        <MaterialDesignIcons
                          name="trash-can-outline"
                          size={16}
                          color={Colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.categoryName}>{item.name}</Text>
                  </View>
                </View>
              </Shadow>
            )}
          />
        </View>
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
          <Text style={styles.title}>Categorias</Text>
          <Text style={styles.subtitle}>Organize suas transações</Text>
        </View>
        <TouchableOpacity
          onPress={() => setAddCategoryVisible(true)}
          style={styles.addCategoryButton}
        >
          <MaterialDesignIcons name="plus" size={24} color={Colors.surface} />
        </TouchableOpacity>
      </View>
      {addCategoryModal()}
      {updateCategoryModal()}
      {renderCategories()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
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
  addCategoryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 8,
    shadowColor: Colors.overlay,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  // Add Category Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCategoryModalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCategoryModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addCategoryModalSubTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  addCategoryModalButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCategoryModalButtonDisabled: {
    backgroundColor: Colors.primaryLight,
  },
  addCategoryModalButtonText: {
    fontSize: 16,
    color: Colors.surface,
    fontWeight: 'bold',
  },
  addCategoryModalInputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  addCategoryModalInputLabel: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  addCategoryModalInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceAlt,
  },
  addCategoryModalInputButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  closeModalButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 8,
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

  previewContainer: {
    marginBottom: 16,
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  categoryPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Category List Styles
  categoriesContainer: {
    flex: 1,
    width: '100%',
  },
  categoryShadowContainer: {
    width: '48%',
    marginBottom: 12,
  },
  categoryShadow: {
    borderRadius: 8,
  },
  categoryTypeTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  categoryContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconContainer: {
    padding: 8,
  },
  categoryName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  editCategoryButton: {},
  removeCategoryButton: {
    marginLeft: 8,
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
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
