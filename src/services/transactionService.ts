import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'TRANSACTIONS';

export type Transaction = {
  id: string;
  type: string;
  description: string;
  value: number;
  categoryId: string;
  categoryName: string;
  date: Date;
  createdAt: string;
  updatedAt: string;
};

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export async function saveTransaction(input: {
  type: string;
  description: string;
  value: number;
  categoryId: string;
  categoryName: string;
  date: Date;
}): Promise<Transaction> {
  const list = await listTransactions();

  if (input.description.trim() === '') {
    throw new Error('A descrição é obrigatória');
  }
  if (isNaN(input.value) || input.value <= 0) {
    throw new Error('O valor deve ser um número positivo');
  }
  if (input.categoryId.trim() === '') {
    throw new Error('A categoria é obrigatória');
  }
  if (!(input.date instanceof Date) || isNaN(input.date.getTime())) {
    throw new Error('A data é inválida');
  }
  const now = new Date().toISOString();
  const newTransaction: Transaction = {
    id: generateId(),
    type: input.type,
    description: input.description.trim(),
    value: input.value,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    date: input.date,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [...list, newTransaction];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return newTransaction;
}

export async function listTransactions(): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function removeTransaction(id: string): Promise<void> {
  const transactions = await listTransactions();
  const updated = transactions.filter(tx => tx.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function getTransactionById(
  id: string,
): Promise<Transaction | null> {
  const transactions = await listTransactions();
  return transactions.find(tx => tx.id === id) || null;
}

export async function updateTransaction(input: {
  id: string;
  type?: string;
  description?: string;
  value?: number;
  categoryId?: string;
  categoryName?: string;
  date?: Date;
}): Promise<Transaction> {
  const transactions = await listTransactions();
  const index = transactions.findIndex(tx => tx.id === input.id);
  if (index === -1) throw new Error('Transação não encontrada');

  const existing = transactions[index];

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
    input.date !== undefined &&
    (!(input.date instanceof Date) || isNaN(input.date.getTime()))
  ) {
    throw new Error('A data é inválida');
  }

  const updatedTransaction: Transaction = {
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
    date: input.date !== undefined ? input.date : existing.date,
    updatedAt: new Date().toISOString(),
  };

  transactions[index] = updatedTransaction;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));

  return updatedTransaction;
}
