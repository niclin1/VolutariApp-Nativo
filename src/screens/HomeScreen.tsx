import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList, Vaga } from '../types';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import VagaCard from '../components/VagaCard';

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type CategoryFilter = 'Todas' | 'Educação' | 'Saúde' | 'Social' | 'Meio Ambiente';

const CATEGORIES: CategoryFilter[] = [
  'Todas',
  'Educação',
  'Saúde',
  'Social',
  'Meio Ambiente',
];

function normalizeStr(str: string | undefined): string {
  return (
    str
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim() ?? ''
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { currentUser, setSelectedVaga, signOut } = useApp();
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('Todas');

  const loadVagas = useCallback(async () => {
    try {
      const data = await api.getVagas();
      setVagas(data);
    } catch (err: unknown) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao carregar vagas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadVagas();
  }, [loadVagas]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadVagas();
  }, [loadVagas]);

  const handleVagaPress = (vaga: Vaga) => {
    setSelectedVaga(vaga);
    navigation.navigate('VagaDetail', { vagaId: vaga.id });
  };

  const handleLogout = async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const filtered =
    activeCategory === 'Todas'
      ? vagas
      : vagas.filter(
          (v) => normalizeStr(v.category) === normalizeStr(activeCategory)
        );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d7a2d" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Olá, {currentUser?.nome?.split(' ')[0] ?? 'Voluntário'} 👋
          </Text>
          <Text style={styles.headerSub}>Encontre sua próxima causa</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileBtn}
          >
            <Text style={styles.profileBtnText}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterContainer}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterPill,
              activeCategory === cat && styles.filterPillActive,
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text
              style={[
                styles.filterPillText,
                activeCategory === cat && styles.filterPillTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Vagas count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {filtered.length} oportunidade{filtered.length !== 1 ? 's' : ''} disponível{filtered.length !== 1 ? 'is' : ''}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VagaCard vaga={item} onPress={handleVagaPress} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2d7a2d']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhuma vaga encontrada nesta categoria.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  greeting: { fontSize: 18, fontWeight: '700', color: '#1a2e1a' },
  headerSub: { fontSize: 13, color: '#5a6b5a', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  profileBtn: {
    padding: 8,
    backgroundColor: '#e8f5e9',
    borderRadius: 20,
  },
  profileBtnText: { fontSize: 18 },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fce4ec',
    borderRadius: 8,
  },
  logoutBtnText: { fontSize: 13, color: '#c62828', fontWeight: '600' },
  filterContainer: { maxHeight: 52 },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ddd',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#2d7a2d',
    borderColor: '#2d7a2d',
  },
  filterPillText: { fontSize: 13, color: '#555' },
  filterPillTextActive: { color: '#fff', fontWeight: '600' },
  countRow: { paddingHorizontal: 20, paddingVertical: 8 },
  countText: { fontSize: 13, color: '#888' },
  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 },
  emptyContainer: { alignItems: 'center', paddingTop: 48 },
  emptyText: { color: '#999', fontSize: 15 },
});
