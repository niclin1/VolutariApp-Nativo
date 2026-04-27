import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList, Vaga } from '../types';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import VagaCard from '../components/VagaCard';

type ProfileNav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNav>();
  const { currentUser, currentUserRole, setSelectedVaga, signOut } = useApp();
  const [myVagas, setMyVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyVagas = useCallback(async () => {
    try {
      const data = await api.getMyVagas();
      setMyVagas(data);
    } catch {
      // Non-critical: user might not have any applications
      setMyVagas([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMyVagas();
  }, [loadMyVagas]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMyVagas();
  }, [loadMyVagas]);

  const handleVagaPress = (vaga: Vaga) => {
    setSelectedVaga(vaga);
    navigation.navigate('VagaDetail', { vagaId: vaga.id });
  };

  const handleQuit = async (vaga: Vaga) => {
    Alert.alert(
      'Cancelar inscrição',
      `Deseja cancelar sua inscrição em "${vaga.title}"?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.quitVaga(vaga.id);
              setMyVagas((prev) => prev.filter((v) => v.id !== vaga.id));
            } catch (err: unknown) {
              Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao cancelar inscrição');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const roleLabel =
    currentUserRole === 'ong'
      ? 'ONG'
      : currentUserRole === 'admin'
        ? 'Admin'
        : 'Voluntário';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2d7a2d']}
          />
        }
      >
        {/* Back */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Voltar</Text>
        </TouchableOpacity>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {currentUser?.nome?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.userName}>{currentUser?.nome ?? 'Usuário'}</Text>
          <Text style={styles.userEmail}>{currentUser?.email ?? ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{myVagas.length}</Text>
            <Text style={styles.statLabel}>Inscrições</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {currentUser?.city ?? '—'}
            </Text>
            <Text style={styles.statLabel}>Cidade</Text>
          </View>
        </View>

        {/* My vagas */}
        <Text style={styles.sectionTitle}>Minhas inscrições</Text>

        {loading ? (
          <ActivityIndicator color="#2d7a2d" style={{ marginTop: 24 }} />
        ) : myVagas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Você ainda não se inscreveu em nenhuma vaga.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.exploreBtnText}>Explorar vagas →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          myVagas.map((vaga) => (
            <View key={vaga.id} style={styles.vagaItem}>
              <View style={styles.vagaCardWrapper}>
                <VagaCard vaga={vaga} onPress={handleVagaPress} />
              </View>
              <TouchableOpacity
                style={styles.quitBtn}
                onPress={() => handleQuit(vaga)}
              >
                <Text style={styles.quitBtnText}>Cancelar inscrição</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },
  scroll: { padding: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backBtnText: { color: '#2d7a2d', fontSize: 15, fontWeight: '600' },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2d7a2d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '700' },
  userName: { fontSize: 20, fontWeight: '700', color: '#1a2e1a', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#888', marginBottom: 10 },
  roleBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: { fontSize: 13, color: '#2e7d32', fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1a2e1a' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a2e1a',
    marginBottom: 12,
  },
  emptyContainer: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 16 },
  exploreBtn: {
    backgroundColor: '#2d7a2d',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  exploreBtnText: { color: '#fff', fontWeight: '600' },
  vagaItem: { marginBottom: 8 },
  vagaCardWrapper: { marginBottom: 0 },
  quitBtn: {
    backgroundColor: '#fce4ec',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 12,
  },
  quitBtnText: { color: '#c62828', fontSize: 13, fontWeight: '600' },
  logoutBtn: {
    marginTop: 24,
    borderWidth: 1.5,
    borderColor: '#c62828',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutBtnText: { color: '#c62828', fontSize: 15, fontWeight: '600' },
});
