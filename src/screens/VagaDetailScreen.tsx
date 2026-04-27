import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList, Vaga } from '../types';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

type VagaDetailNav = NativeStackNavigationProp<RootStackParamList, 'VagaDetail'>;
type VagaDetailRoute = RouteProp<RootStackParamList, 'VagaDetail'>;

const CATEGORY_COLORS: Record<string, string> = {
  Educação: '#e8f5e9',
  Saúde: '#fce4ec',
  Social: '#fff8e1',
  'Meio Ambiente': '#e8f5e9',
};

export default function VagaDetailScreen() {
  const navigation = useNavigation<VagaDetailNav>();
  const route = useRoute<VagaDetailRoute>();
  const { selectedVaga, setSelectedVaga } = useApp();
  const [vaga, setVaga] = useState<Vaga | null>(selectedVaga);
  const [loading, setLoading] = useState(!selectedVaga);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (selectedVaga) {
      setVaga(selectedVaga);
      setLoading(false);
      return;
    }
    const loadVaga = async () => {
      try {
        const data = await api.getVaga(route.params.vagaId);
        setVaga(data);
        if (data) setSelectedVaga(data);
      } catch (err: unknown) {
        Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao carregar vaga');
      } finally {
        setLoading(false);
      }
    };
    loadVaga();
  }, [route.params.vagaId, selectedVaga, setSelectedVaga]);

  const handleApply = async () => {
    if (!vaga) return;
    setApplying(true);
    try {
      await api.applyToVaga(vaga.id);
      Alert.alert('Sucesso', 'Inscrição realizada com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Profile'),
        },
      ]);
    } catch (err: unknown) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao realizar inscrição');
    } finally {
      setApplying(false);
    }
  };

  const handleShare = async () => {
    if (!vaga) return;
    try {
      await Share.share({
        title: vaga.title,
        message: `Confira esta vaga de voluntariado na ${vaga.ong}: ${vaga.title}\n\nCategoria: ${vaga.category}\n${vaga.description}`,
      });
    } catch {
      // User cancelled share
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d7a2d" />
      </SafeAreaView>
    );
  }

  if (!vaga) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Vaga não encontrada.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const categoryBg = CATEGORY_COLORS[vaga.category] ?? '#f0f4f0';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Voltar</Text>
        </TouchableOpacity>

        {/* Hero card */}
        <View style={[styles.heroCard, { backgroundColor: categoryBg }]}>
          <View style={styles.heroHeader}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>{vaga.icon}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroOng}>{vaga.ong}</Text>
              <Text style={styles.heroCity}>📍 {vaga.city}</Text>
            </View>
            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <Text style={styles.shareBtnText}>↗</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.heroTitle}>{vaga.title}</Text>

          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{vaga.category}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{vaga.modality}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{vaga.status}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{vaga.hoursPerWeek}h</Text>
            <Text style={styles.statLabel}>por semana</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{vaga.totalSlots}</Text>
            <Text style={styles.statLabel}>vagas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{vaga.startDate}</Text>
            <Text style={styles.statLabel}>início</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{vaga.availability}</Text>
            <Text style={styles.statLabel}>disponib.</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre a vaga</Text>
          <Text style={styles.sectionBody}>{vaga.description}</Text>
        </View>

        {/* ONG info */}
        {(vaga.ongEmail || vaga.ongPhone) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contato da ONG</Text>
            {vaga.ongEmail && (
              <Text style={styles.contactItem}>✉️ {vaga.ongEmail}</Text>
            )}
            {vaga.ongPhone && (
              <Text style={styles.contactItem}>📞 {vaga.ongPhone}</Text>
            )}
            {vaga.ongSince && (
              <Text style={styles.contactItem}>
                🗓 Desde {vaga.ongSince}
              </Text>
            )}
          </View>
        )}

        {/* Apply button */}
        <TouchableOpacity
          style={[styles.applyBtn, applying && styles.applyBtnDisabled]}
          onPress={handleApply}
          disabled={applying}
        >
          {applying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.applyBtnText}>Quero me voluntariar →</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  errorText: { fontSize: 16, color: '#666', marginBottom: 12 },
  backLink: { color: '#2d7a2d', fontSize: 15 },
  scroll: { padding: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backBtnText: { color: '#2d7a2d', fontSize: 15, fontWeight: '600' },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 22 },
  heroInfo: { flex: 1 },
  heroOng: { fontSize: 15, fontWeight: '700', color: '#1a2e1a' },
  heroCity: { fontSize: 13, color: '#555' },
  shareBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 8,
  },
  shareBtnText: { fontSize: 16, color: '#444' },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a2e1a',
    lineHeight: 26,
    marginBottom: 12,
  },
  tagRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 20,
  },
  tagText: { fontSize: 12, color: '#444', fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: { fontSize: 14, fontWeight: '700', color: '#1a2e1a' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2, textAlign: 'center' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a2e1a',
    marginBottom: 8,
  },
  sectionBody: { fontSize: 14, color: '#444', lineHeight: 22 },
  contactItem: { fontSize: 14, color: '#444', marginBottom: 6 },
  applyBtn: {
    backgroundColor: '#2d7a2d',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  applyBtnDisabled: { opacity: 0.6 },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
