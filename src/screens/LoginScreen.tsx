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

type LoginNav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
  const { userType, setUserType, signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.login(email.trim(), password);
      const user = data.user;
      const token = user.token ?? email; // use token field if available
      await signIn(token, {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role as 'volunteer' | 'ong' | 'admin' | 'guest',
      });

      if (user.role === 'ong' || user.role === 'admin') {
        navigation.reset({ index: 0, routes: [{ name: 'OngHome' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    } catch (err: unknown) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha no login');
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
          <Text style={styles.title}>Bem-vindo de volta</Text>

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
              ? 'Entre para continuar transformando vidas'
              : 'Entre para continuar gerenciando suas causas'}
          </Text>

          <View style={styles.form}>
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
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Entrar →</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footer}>
              Ainda não tem uma conta?{' '}
              <Text style={styles.link}>Cadastre-se</Text>
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
  form: { gap: 8 },
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
