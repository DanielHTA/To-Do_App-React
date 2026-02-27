import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, Alert, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Icone standard di Expo

type Category = 'Lavoro' | 'Personale' | 'Spesa';
interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: Category;
  createdAt: number;
}
type FilterType = 'all' | 'todo' | 'completed';

const CATEGORY_COLORS: Record<Category, string> = {
  Lavoro: '#5AC8FA',
  Personale: '#AF52DE',
  Spesa: '#FF2D55',
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Personale');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const saved = await AsyncStorage.getItem('@tasks_v4');
        if (saved) setTasks(JSON.parse(saved));
      } finally { setIsLoaded(true); }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    if (isLoaded) AsyncStorage.setItem('@tasks_v4', JSON.stringify(tasks));
  }, [tasks, isLoaded]);

  const addTask = () => {
    if (!inputText.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: inputText.trim(),
      completed: false,
      category: selectedCategory,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    setInputText('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    const performDelete = () => setTasks(prev => prev.filter(t => t.id !== id));
    if (Platform.OS === 'web') {
      if (confirm("Eliminare questa attività?")) performDelete();
    } else {
      Alert.alert("Elimina", "Rimuovere il task?", [
        { text: "Annulla", style: "cancel" },
        { text: "Elimina", style: "destructive", onPress: performDelete }
      ]);
    }
  };

  // Calcolo statistiche per la barra di progresso
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) : 0;

  const filteredTasks = tasks.filter(t => {
    if (filter === 'todo') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header & Progress */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>I miei Task</Text>
          <Text style={styles.headerSubtitle}>{completedCount} di {tasks.length} completati</Text>
        </View>
        <View style={styles.progressContainer}>
           <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Input Section */}
      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="Cosa vuoi fare oggi?"
          value={inputText}
          onChangeText={setInputText}
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTask}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Category Selection */}
      <View style={styles.categoryRow}>
        {(['Lavoro', 'Personale', 'Spesa'] as Category[]).map(cat => (
          <TouchableOpacity 
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[styles.catBadge, selectedCategory === cat && { backgroundColor: CATEGORY_COLORS[cat] }]}
          >
            <Text style={[styles.catBadgeText, selectedCategory === cat && { color: '#fff' }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {['all', 'todo', 'completed'].map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f as FilterType)} style={styles.tab}>
            <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>
              {f === 'all' ? 'Tutti' : f === 'todo' ? 'In corso' : 'Fatti'}
            </Text>
            {filter === f && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={80} color="#DDD" />
            <Text style={styles.emptyText}>Ancora nulla qui!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <TouchableOpacity style={styles.checkArea} onPress={() => toggleTask(item.id)}>
              <Ionicons 
                name={item.completed ? "checkbox" : "square-outline"} 
                size={24} 
                color={item.completed ? CATEGORY_COLORS[item.category] : "#CCC"} 
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.taskText, item.completed && styles.taskTextDone]}>{item.text}</Text>
                <Text style={[styles.catLabel, { color: CATEGORY_COLORS[item.category] }]}>{item.category}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteIcon}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', paddingTop: 60, paddingHorizontal: 20 },
  header: { marginBottom: 25 },
  headerTitle: { fontSize: 34, fontWeight: '800', color: '#1C1C1E' },
  headerSubtitle: { fontSize: 15, color: '#8E8E93', marginTop: 4 },
  progressContainer: { height: 6, backgroundColor: '#E5E5EA', borderRadius: 3, marginTop: 15, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#34C759' },
  
  inputCard: { 
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, 
    padding: 8, alignItems: 'center', marginBottom: 15,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  input: { flex: 1, height: 45, paddingHorizontal: 15, fontSize: 16 },
  addBtn: { backgroundColor: '#007AFF', width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 25 },
  catBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#E5E5EA' },
  catBadgeText: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
  
  filterTabs: { flexDirection: 'row', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  tab: { marginRight: 25, paddingBottom: 10, alignItems: 'center' },
  tabText: { fontSize: 16, fontWeight: '600', color: '#8E8E93' },
  tabTextActive: { color: '#007AFF' },
  tabIndicator: { position: 'absolute', bottom: -1, width: '100%', height: 3, backgroundColor: '#007AFF', borderRadius: 3 },
  
  taskCard: { 
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, 
    flexDirection: 'row', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1
  },
  checkArea: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  taskText: { fontSize: 17, fontWeight: '500', color: '#1C1C1E' },
  taskTextDone: { textDecorationLine: 'line-through', color: '#8E8E93' },
  catLabel: { fontSize: 11, fontWeight: '700', marginTop: 2, textTransform: 'uppercase' },
  deleteIcon: { padding: 8 },
  
  emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
  emptyText: { marginTop: 15, fontSize: 18, fontWeight: '500', color: '#8E8E93' }
});