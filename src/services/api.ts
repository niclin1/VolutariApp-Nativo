import { getToken } from './tokenStorage';
import { Vaga, Category } from '../types';

// Base URL for the VoluntariApp API backend
// In development, set EXPO_PUBLIC_API_URL in your .env file
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Erro desconhecido');
  }

  return data as T;
}

export interface LoginResponse {
  user: {
    id: number;
    nome: string;
    email: string;
    role: string;
    token?: string;
  };
}

export interface RegisterPayload {
  nome: string;
  email: string;
  password: string;
  city?: string;
  state?: string;
  interestArea?: string;
  availability?: string;
  modality?: string;
  role: 'volunteer' | 'ong';
}

export interface OngPayload {
  nome: string;
  email: string;
  localidade: string;
  telefone?: string;
  latitude?: number;
  longitude?: number;
}

export function mapTrabalho(t: Record<string, unknown>): Vaga {
  return {
    id: String(t['id']),
    title: String(t['titulo']),
    ong: String(t['ong_nome'] ?? 'ONG Parceira'),
    city: String(t['ong_city'] ?? 'Remoto/Local'),
    category: ((t['categoria'] as string)?.trim() as Category) ?? 'Social',
    modality: 'Híbrido',
    availability: String(t['disponibilidade'] ?? ''),
    hoursPerWeek: String(t['carga_horaria'] ?? ''),
    totalSlots: Number(t['n_vagas'] ?? 0),
    filledSlots: 0,
    startDate: t['criado_em']
      ? new Date(String(t['criado_em'])).toLocaleDateString('pt-BR')
      : '',
    description: String(t['descricao'] ?? ''),
    requirements: [],
    icon:
      t['categoria'] === 'Educação'
        ? '📚'
        : t['categoria'] === 'Saúde'
          ? '💚'
          : t['categoria'] === 'Meio Ambiente'
            ? '🌱'
            : '🤝',
    status: 'Ativa',
    ongEmail: t['ong_email'] ? String(t['ong_email']) : undefined,
    ongPhone: t['ong_phone'] ? String(t['ong_phone']) : undefined,
    ongSince: t['ong_since']
      ? String(new Date(String(t['ong_since'])).getFullYear())
      : '2023',
  };
}

export const api = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(payload: RegisterPayload): Promise<LoginResponse> {
    return request<LoginResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async registerOng(payload: OngPayload): Promise<unknown> {
    return request<unknown>('/api/v1/ong', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe(): Promise<LoginResponse['user']> {
    return request<LoginResponse['user']>('/api/v1/auth/me');
  },

  async logout(): Promise<void> {
    await request<void>('/api/v1/auth/logout', { method: 'POST' });
  },

  async getVagas(longitude?: number, latitude?: number): Promise<Vaga[]> {
    let path = '/api/v1/trabalho';
    if (longitude !== undefined && latitude !== undefined) {
      path = `/api/v1/trabalho-closest?longitude=${longitude}&latitude=${latitude}&raio=10000`;
    }
    const data = await request<Record<string, unknown>[]>(path);
    return data.map(mapTrabalho);
  },

  async getVaga(id: string): Promise<Vaga | null> {
    const data = await request<Record<string, unknown>[]>(
      `/api/v1/trabalho?id=${id}`
    );
    if (data.length === 0) return null;
    return mapTrabalho(data[0]);
  },

  async applyToVaga(trabalhoId: string): Promise<void> {
    await request<void>('/api/v1/trabalho/apply', {
      method: 'POST',
      body: JSON.stringify({ trabalho_id: trabalhoId }),
    });
  },

  async quitVaga(trabalhoId: string): Promise<void> {
    await request<void>('/api/v1/trabalho/quit', {
      method: 'POST',
      body: JSON.stringify({ trabalho_id: trabalhoId }),
    });
  },

  async getMyVagas(): Promise<Vaga[]> {
    const data = await request<Record<string, unknown>[]>(
      '/api/v1/trabalho/my-aplicacoes'
    );
    return data.map(mapTrabalho);
  },
};
