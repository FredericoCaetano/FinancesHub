import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialDesignIconsIconName } from '@react-native-vector-icons/material-design-icons';
import { Alert } from 'react-native';

const STORAGE_KEY = 'CATEGORIES';

export type Category = {
  id: string;
  name: string;
  type: string;
  icon: MaterialDesignIconsIconName;
  color: string;
  createdAt: string;
  updatedAt: string;
};

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export async function saveCategory(input: {
  name: string;
  type: string;
  icon: MaterialDesignIconsIconName;
  color: string;
}): Promise<Category> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const list: Category[] = raw ? JSON.parse(raw) : [];

  for (const cat of list) {
    if (cat.name.toLowerCase() === input.name.trim().toLowerCase()) {
      Alert.alert('Erro', 'Já existe uma categoria com esse nome.');
      throw new Error('Já existe uma categoria com esse nome');
    }
  }

  const now = new Date().toISOString();
  const newCategory: Category = {
    id: generateId(),
    name: input.name.trim(),
    type: input.type,
    icon: input.icon,
    color: input.color,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [...list, newCategory];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return newCategory;
}

export async function listCategories(): Promise<Category[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function removeCategory(id: string): Promise<void> {
  const categories = await listCategories();
  const updated = categories.filter(cat => cat.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function getCategoryById(name: string): Promise<Category | null> {
  const categories = await listCategories();
  return categories.find(cat => cat.name === name) || null;
}

export async function updateCategory(input: {
  id: string;
  name?: string;
  type?: string;
  icon?: MaterialDesignIconsIconName;
  color?: string;
}): Promise<Category> {
  const categories = await listCategories();
  const index = categories.findIndex(cat => cat.id === input.id);
  if (index === -1) throw new Error('Categoria não encontrada');

  const existing = categories[index];
  const updatedCategory: Category = {
    ...existing,
    name: input.name !== undefined ? input.name.trim() : existing.name,
    type: input.type ?? existing.type,
    icon: input.icon ?? existing.icon,
    color: input.color ?? existing.color,
    updatedAt: new Date().toISOString(),
  };

  categories[index] = updatedCategory;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(categories));

  return updatedCategory;
}
