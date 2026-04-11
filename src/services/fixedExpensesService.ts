import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'FIXED_EXPENSES';

export type FixedExpense = {
  id: string;
  type: string;
  description: string;
  value: number;
  categoryId: string;
  categoryName: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: Date;
  status: boolean;
};

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export async function saveFixedExpense(input: {
  type: string;
  description: string;
  value: number;
  categoryId: string;
  categoryName: string;
  nextDate: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: boolean;
}): Promise<FixedExpense> {
  const list = await listFixedExpenses();

  if (input.description.trim() === '') {
    throw new Error('A descrição é obrigatória');
  }
  if (isNaN(input.value) || input.value <= 0) {
    throw new Error('O valor deve ser um número positivo');
  }
  if (input.categoryId.trim() === '') {
    throw new Error('A categoria é obrigatória');
  }
  if (!(input.nextDate instanceof Date) || isNaN(input.nextDate.getTime())) {
    throw new Error('A data é inválida');
  }
  const newFixedExpense: FixedExpense = {
    id: generateId(),
    type: input.type,
    description: input.description.trim(),
    value: input.value,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    nextDate: input.nextDate,
    frequency: input.frequency,
    status: input.status,   
  };

  const updated = [...list, newFixedExpense];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return newFixedExpense;
}

export async function listFixedExpenses(): Promise<FixedExpense[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function removeFixedExpense(id: string): Promise<void> {
  const list = await listFixedExpenses();
  const updated = list.filter(item => item.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function getFixedExpenseById(
  id: string,
): Promise<FixedExpense | null> {
  const list = await listFixedExpenses();
  return list.find(item => item.id === id) || null;
}

export async function updateFixedExpense(input: {
  id: string;
  description?: string;
  value?: number;
  categoryId?: string;
  categoryName?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate?: Date;
  status?: boolean;
  type?: string;
}): Promise<FixedExpense> {
  const list = await listFixedExpenses();
  const existing = list.find(item => item.id === input.id);
  if (!existing) {
    throw new Error('Despesa fixa não encontrada');
  }

  if (input.description !== undefined && input.description.trim() === '') {
    throw new Error('A descrição é obrigatória');
  }
  if (input.value !== undefined && (isNaN(input.value) || input.value <= 0)) {
    throw new Error('O valor deve ser um número positivo');
  }
  if (input.categoryId !== undefined && input.categoryId.trim() === '') {
    throw new Error('A categoria é obrigatória');
  }
  if (
    input.nextDate !== undefined &&
    (!(input.nextDate instanceof Date) || isNaN(input.nextDate.getTime()))
  ) {
    throw new Error('A data é inválida');
  }

  const updatedFixedExpense: FixedExpense = {
    ...existing,
    type: input.type !== undefined ? input.type : existing.type,
    description:
      input.description !== undefined
        ? input.description.trim()
        : existing.description,
    value: input.value !== undefined ? input.value : existing.value,
    categoryId:
      input.categoryId !== undefined ? input.categoryId : existing.categoryId,
    categoryName:
      input.categoryName !== undefined
        ? input.categoryName
        : existing.categoryName,
    nextDate: input.nextDate !== undefined ? input.nextDate : existing.nextDate,
    frequency:
      input.frequency !== undefined ? input.frequency : existing.frequency,
    status: input.status !== undefined ? input.status : existing.status,
  };

  const updated = list.map(item =>
    item.id === input.id ? updatedFixedExpense : item,
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return updatedFixedExpense;
}
 export async function toggleFixedExpenseStatus(id: string, status?: boolean): Promise<FixedExpense> {
  const list = await listFixedExpenses();
  const existing = list.find(item => item.id === id);
  if (!existing) {
    throw new Error('Despesa fixa não encontrada');
  }

  const updatedFixedExpense: FixedExpense = {
    ...existing,
    status: status !== undefined ? status : !existing.status,
  };

  const updated = list.map(item =>
    item.id === id ? updatedFixedExpense : item,
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return updatedFixedExpense;
}
