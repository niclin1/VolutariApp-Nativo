export type Category = 'Educação' | 'Saúde' | 'Social' | 'Meio Ambiente';

export type UserRole = 'admin' | 'ong' | 'volunteer' | 'guest';

export interface Vaga {
  id: string;
  title: string;
  ong: string;
  city: string;
  category: Category;
  modality: string;
  availability: string;
  hoursPerWeek: string;
  totalSlots: number;
  filledSlots: number;
  startDate: string;
  description: string;
  requirements: string[];
  icon: string;
  status: string;
  ongEmail?: string;
  ongPhone?: string;
  ongSince?: string;
}

export interface User {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  city?: string;
  state?: string;
}

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  VagaDetail: { vagaId: string };
  Profile: undefined;
  OngHome: undefined;
};
