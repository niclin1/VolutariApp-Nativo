import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Vaga } from '../types';

interface VagaCardProps {
  vaga: Vaga;
  onPress: (vaga: Vaga) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Educação: '#e8f5e9',
  Saúde: '#fce4ec',
  Social: '#fff8e1',
  'Meio Ambiente': '#e8f5e9',
  Outros: '#f3e5f5',
};

const CATEGORY_TEXT_COLORS: Record<string, string> = {
  Educação: '#2e7d32',
  Saúde: '#c62828',
  Social: '#f57f17',
  'Meio Ambiente': '#1b5e20',
  Outros: '#6a1b9a',
};

export default function VagaCard({ vaga, onPress }: VagaCardProps) {
  const bgColor = CATEGORY_COLORS[vaga.category] ?? '#f0f0f0';
  const textColor = CATEGORY_TEXT_COLORS[vaga.category] ?? '#333';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(vaga)}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{vaga.icon}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: bgColor }]}>
          <Text style={[styles.categoryText, { color: textColor }]}>
            {vaga.category}
          </Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {vaga.title}
      </Text>
      <Text style={styles.ong} numberOfLines={1}>
        {vaga.ong}
      </Text>

      <View style={styles.meta}>
        <Text style={styles.metaItem}>📍 {vaga.city}</Text>
        <Text style={styles.metaItem}>⏱ {vaga.hoursPerWeek}h/sem</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.slotsBadge}>
          <Text style={styles.slotsText}>
            {vaga.totalSlots} vagas disponíveis
          </Text>
        </View>
        <Text style={styles.modality}>{vaga.modality}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: { fontSize: 24 },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: { fontSize: 12, fontWeight: '600' },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a2e1a',
    marginBottom: 4,
    lineHeight: 22,
  },
  ong: { fontSize: 14, color: '#2d7a2d', marginBottom: 10 },
  meta: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metaItem: { fontSize: 13, color: '#666' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotsBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  slotsText: { fontSize: 12, color: '#2e7d32', fontWeight: '600' },
  modality: { fontSize: 12, color: '#888' },
});
