import React from 'react';
import { Modal, View, Text, StyleSheet,TouchableOpacity, ScrollView,ModalProps} from 'react-native';

interface ServingPickerProps extends Omit<ModalProps, 'visible'> {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  currentValue: string;
}

const ServingPicker: React.FC<ServingPickerProps> = ({ 
  isVisible, 
  onClose, 
  onSelect, 
  currentValue 
}) => {
  //generate serving sizes from 0.25 to 10 in 0.25 increments
  const servingSizes: number[] = Array.from(
    { length: 40 }, 
    (_, i) => (i + 1) * 0.25
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Select Serving Size</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            {servingSizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.servingOption,
                  currentValue === size.toString() && styles.selectedOption
                ]}
                onPress={() => {
                  onSelect(size.toString());
                  onClose();
                }}
              >
                <Text style={[
                  styles.servingText,
                  currentValue === size.toString() && styles.selectedText
                ]}>
                  {size} serving{size !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  scrollView: {
    maxHeight: 300,
  },
  servingOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedOption: {
    backgroundColor: '#f0f0ff',
  },
  servingText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: '#0d0dd4',
    fontWeight: 'bold',
  },
});

export default ServingPicker;