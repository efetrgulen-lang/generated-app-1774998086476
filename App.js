import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, KeyboardAvoidingView, Platform, Alert, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('@notes');
      if (storedNotes !== null) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (e) {
      console.error('Notlar yüklenirken hata oluştu', e);
    }
  };

  const saveNotes = async (newNotes) => {
    try {
      await AsyncStorage.setItem('@notes', JSON.stringify(newNotes));
    } catch (e) {
      console.error('Notlar kaydedilirken hata oluştu', e);
    }
  };

  const addNote = () => {
    if (title.trim() === '' || content.trim() === '') {
      Alert.alert('Eksik Bilgi', 'Lütfen başlık ve içerik alanlarını doldurun.');
      return;
    }
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toLocaleDateString('tr-TR'),
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setTitle('');
    setContent('');
    setModalVisible(false);
  };

  const deleteNote = (id) => {
    Alert.alert('Notu Sil', 'Bu notu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { 
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          const updatedNotes = notes.filter(note => note.id !== id);
          setNotes(updatedNotes);
          saveNotes(updatedNotes);
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
        <TouchableOpacity onPress={() => deleteNote(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.noteContent} numberOfLines={3}>{item.content}</Text>
      <Text style={styles.noteDate}>{item.date}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <Text style={styles.headerTitle}>Notlarım</Text>
      
      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz bir not eklemediniz.
İlk notunuzu oluşturmak için + butonuna dokunun.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Yeni Not</Text>
            <TextInput
              style={styles.inputTitle}
              placeholder="Not Başlığı"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
            <TextInput
              style={styles.inputContent}
              placeholder="Notunuzu buraya yazın..."
              placeholderTextColor="#999"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={addNote}>
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerTitle: { fontSize: 34, fontWeight: '800', color: '#1A1A1A', marginHorizontal: 20, marginTop: 20, marginBottom: 15 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  noteCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  noteTitle: { fontSize: 19, fontWeight: '700', color: '#2D3436', flex: 1, marginRight: 10 },
  deleteBtn: { backgroundColor: '#FF7675', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  noteContent: { fontSize: 15, color: '#636E72', marginBottom: 15, lineHeight: 22 },
  noteDate: { fontSize: 12, color: '#B2BEC3', textAlign: 'right', fontWeight: '500' },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#0984E3', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#0984E3', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  fabText: { fontSize: 32, color: '#FFF', fontWeight: '300', lineHeight: 34 },
  emptyText: { textAlign: 'center', color: '#A4B0BE', marginTop: 60, fontSize: 16, lineHeight: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFF', borderRadius: 24, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 10 },
  modalHeader: { fontSize: 22, fontWeight: '800', color: '#2D3436', marginBottom: 20, textAlign: 'center' },
  inputTitle: { borderBottomWidth: 1.5, borderBottomColor: '#DFE6E9', fontSize: 18, paddingVertical: 12, marginBottom: 20, color: '#2D3436', fontWeight: '600' },
  inputContent: { height: 140, fontSize: 16, color: '#2D3436', backgroundColor: '#F5F6FA', borderRadius: 12, padding: 15, marginBottom: 25 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, backgroundColor: '#DFE6E9', paddingVertical: 14, borderRadius: 12, marginRight: 8, alignItems: 'center' },
  saveBtn: { flex: 1, backgroundColor: '#0984E3', paddingVertical: 14, borderRadius: 12, marginLeft: 8, alignItems: 'center' },
  cancelBtnText: { color: '#2D3436', fontWeight: '700', fontSize: 16 },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});