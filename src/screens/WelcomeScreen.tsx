import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';

type WelcomeNav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNav>();
  const { setUserType } = useApp();

  const handleVolunteer = () => {
    setUserType('volunteer');
    navigation.navigate('Register');
  };

  const handleOng = () => {
    setUserType('ong');
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.emoji}>🌱</Text>

        <Text style={styles.title}>
          Transforme seu{' '}
          <Text style={styles.highlight}>tempo em impacto</Text>
        </Text>

        <Text style={styles.subtitle}>
          Conectamos voluntários a ONGs que precisam de você.{'\n'}
          Juntos construímos um futuro melhor.
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={handleVolunteer}
          >
            <Text style={styles.btnPrimaryText}>Quero me voluntariar →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={handleOng}
          >
            <Text style={styles.btnSecondaryText}>Sou uma ONG</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>
            Já tenho uma conta{' '}
            <Text style={styles.loginLinkBold}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a2e1a',
    textAlign: 'center',
    lineHeight: 36,
  },
  highlight: {
    color: '#2d7a2d',
  },
  subtitle: {
    fontSize: 16,
    color: '#5a6b5a',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#2d7a2d',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#2d7a2d',
  },
  btnSecondaryText: {
    color: '#2d7a2d',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 8,
  },
  loginLinkText: {
    color: '#5a6b5a',
    fontSize: 14,
  },
  loginLinkBold: {
    color: '#2d7a2d',
    fontWeight: '600',
  },
});
