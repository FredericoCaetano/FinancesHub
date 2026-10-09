import { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../theme';

type DateFieldProps = {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  maximumDate?: Date;
  formVisible: boolean;
};

export default function DateField({
  label = 'Data',
  value,
  onChange,
  maximumDate,
  formVisible,
}: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(value);

  useEffect(() => {
    if (!formVisible) {
      setIsOpen(false);
    }
  }, [formVisible]);

  const openDatePicker = () => {
    setDraftDate(value);
    setIsOpen(true);
  };

  const closeDatePicker = () => {
    setIsOpen(false);
  };

  const handleValueChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate: Date,
  ) => {
    if (Platform.OS === 'ios') {
      setDraftDate(selectedDate);
      return;
    }

    onChange(selectedDate);
    closeDatePicker();
  };

  const confirmDate = () => {
    onChange(draftDate);
    closeDatePicker();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.field}
        onPress={openDatePicker}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value.toLocaleDateString('pt-BR')}`}
      >
        <Text style={styles.value}>{value.toLocaleDateString('pt-BR')}</Text>
        <MaterialDesignIcons name="calendar-month" size={24} color="gray" />
      </TouchableOpacity>

      {isOpen && formVisible && (
        <View>
          <DateTimePicker
            value={draftDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={maximumDate}
            onValueChange={handleValueChange}
            onDismiss={closeDatePicker}
            themeVariant="light"
          />

          {Platform.OS === 'ios' && (
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={closeDatePicker}
                accessibilityRole="button"
                accessibilityLabel="Cancelar seleção de data"
              >
                <Text style={styles.actionText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmDate}
                accessibilityRole="button"
                accessibilityLabel="Confirmar seleção de data"
              >
                <Text style={styles.actionText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceAlt,
  },
  value: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  actionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
