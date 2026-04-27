import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

type RegisterNav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const encoded = encodeURIComponent(address);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      { headers: { 'User-Agent': 'VoluntariApp-Native/1.0' } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNav>();
  const { userType, setUserType, signIn } = useApp();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha nome, e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      const userData = await api.register({
        nome: nome.trim(),
        email: email.trim(),
        password,
        city: localidade.trim() || 'Não informado',
        state: 'SP',
        interestArea: 'Outros',
        availability: 'Integral',
        modality: 'Remoto',
        role: userType,
      });

      if (userType === 'ong') {
        let coords: { lat: number; lng: number } | null = null;
        if (localidade.trim()) {
          coords = await geocodeAddress(localidade.trim());
          if (!coords) {
            Alert.alert(
              'Aviso',
              'Não foi possível localizar o endereço no mapa. Você poderá atualizar depois.'
            );
          }
        }
        try {
          await api.registerOng({
            nome: nome.trim(),
            email: email.trim(),
            localidade: localidade.trim() || 'Não informado',
            telefone: telefone.trim() || '000000000',
            ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
          });
        } catch {
          Alert.alert('Aviso', 'Conta criada, mas falha ao cadastrar detalhes da ONG.');
        }
      }

      const user = userData.user;
      const token = user.token ?? email;
      await signIn(token, {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role as 'volunteer' | 'ong' | 'admin' | 'guest',
      });

      if (userType === 'ong') {
        navigation.reset({ index: 0, routes: [{ name: 'OngHome' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    } catch (err: unknown) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.emoji}>🌱</Text>
          <Text style={styles.title}>Criar uma conta</Text>

          {/* Role selector */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                userType === 'volunteer' && styles.toggleBtnActive,
              ]}
              onPress={() => setUserType('volunteer')}
            >
              <Text
                style={[
                  styles.toggleText,
                  userType === 'volunteer' && styles.toggleTextActive,
                ]}
              >
                Voluntário
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                userType === 'ong' && styles.toggleBtnActive,
              ]}
              onPress={() => setUserType('ong')}
            >
              <Text
                style={[
                  styles.toggleText,
                  userType === 'ong' && styles.toggleTextActive,
                ]}
              >
                ONG
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {userType === 'volunteer'
              ? 'Cadastre-se para começar a transformar vidas'
              : 'Cadastre sua ONG e conecte-se a voluntários'}
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>
              {userType === 'volunteer' ? 'Nome completo' : 'Nome da ONG'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.label}>
              {userType === 'volunteer' ? 'Cidade' : 'Localidade / Endereço'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: São Paulo, SP"
              value={localidade}
              onChangeText={setLocalidade}
            />

            {userType === 'ong' && (
              <>
                <Text style={styles.label}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(11) 99999-9999"
                  keyboardType="phone-pad"
                  value={telefone}
                  onChangeText={setTelefone}
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Criar conta →</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footer}>
              Já tem uma conta?{' '}
              <Text style={styles.link}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emoji: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a2e1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  toggleBtnActive: {
    backgroundColor: '#2d7a2d',
    borderColor: '#2d7a2d',
  },
  toggleText: { fontSize: 14, color: '#555' },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
  subtitle: {
    fontSize: 14,
    color: '#5a6b5a',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: { gap: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
    marginBottom: 8,
  },
  btn: {
    backgroundColor: '#2d7a2d',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { color: '#777', textAlign: 'center', marginTop: 20, fontSize: 14 },
  link: { color: '#2d7a2d', fontWeight: '600' },
});
