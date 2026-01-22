
export enum IncidentType {
  CVLI = 'CVLI',
  MORTE_INTERVENCAO = 'MORTE POR INTERVENÇÃO POLICIAL',
  ARMA_FOGO = 'APREENSÃO DE ARMA DE FOGO',
  CADAVER = 'ACHADO DE CADÁVER',
  SUICIDIO = 'SUICÍDIO',
  MANDADO = 'MANDADO DE PRISÃO',
  DROGAS = 'APREENSÃO DE DROGAS',
  SIMULACRO = 'APREENSÃO DE SIMULACRO',
  VEICULO_RECUPERADO = 'VEÍCULO RECUPERADO',
  FURTO_VEICULO = 'FURTO DE VEÍCULO',
  ROUBO_RESIDENCIA = 'ROUBO À RESIDÊNCIA',
  ROUBO_COMERCIAL = 'ROUBO À ESTAB. COMERCIAL',
  ROUBO_VEICULO = 'ROUBO DE VEÍCULO',
  ROUBO_PESSOA = 'ROUBO À PESSOA',
  TENTATIVA_HOMICIDIO = 'TENTATIVA DE HOMICÍDIO',
  TENTATIVA_ROUBO = 'TENTATIVA DE ROUBO',
  TENTATIVA_LATROCINIO = 'TENTATIVA DE LATROCÍNIO',
  TENTATIVA_FEMINICIDIO = 'TENTATIVA DE FEMINICÍDIO',
  VIOLENCIA_DOMESTICA = 'VIOLÊNCIA DOMÉSTICA',
  ESTUPRO_VULNERAVEL = 'ESTUPRO DE VULNERÁVEL',
  APREENSAO_VEICULO = 'APREENSÃO DE VEÍCULO',
  DESACATO = 'DESACATO / DESOBEDIÊNCIA',
  IMPORTUNACAO_SEXUAL = 'IMPORTUNAÇÃO SEXUAL',
  AMEACA = 'AMEAÇA',
  ASSEDIO = 'ASSÉDIO',
  INJURIA = 'INJÚRIA',
  ARROMBAMENTO = 'ARROMBAMENTO',
  ASSOCIACAO_CRIMINOSA = 'ASSOCIAÇÃO CRIMINOSA',
  TENTATIVA_ESTUPRO = 'TENTATIVA DE ESTUPRO',
  ESTELIONATO = 'ESTELIONATO',
  ACIDENTE_TRANSITO = 'ACIDENTE DE TRÂNSITO',
  ACIDENTE_FATAL = 'ACIDENTE COM VÍTIMA FATAL',
  EMBRIAGUEZ = 'EMBRIAGUEZ AO VOLANTE',
  CONSUMO_DROGAS = 'CONSUMO PESSOAL DE DROGAS',
  VIAS_DE_FATO = 'VIAS DE FATO',
  DIFAMACAO = 'DIFAMAÇÃO',
  INVASAO_DOMICILIAR = 'INVASÃO DOMICILIAR',
  PRESERVACAO_DIREITO = 'PRESERVAÇÃO DE DIREITO',
  LESAO_CORPORAL = 'LESÃO CORPORAL',
  LESAO_ARMA_FOGO = 'LESÃO CORPORAL (PAF)',
  SEQUESTRO = 'SEQUESTRO',
  QUEBRA_MEDIDA = 'QUEBRA DE MEDIDA PROTETIVA',
  VIOLACAO_TORNOZELEIRA = 'VIOLAÇÃO DE TORNOZELEIRA',
  OUTRO = 'OUTRO (ESPECIFICAR)'
}

export enum IncidentStatus {
  PENDENTE = 'Pendente',
  CONCLUIDO = 'Concluído'
}

export interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

export interface Incident {
  id: string;
  type: IncidentType | string;
  incidentNumber: string;
  isTco?: boolean; // Novo campo para identificar TCO vs BO
  sigma: string;
  description: string;
  location: Location;
  date: string;
  status: IncidentStatus;
  reportedBy: string;
  createdAt: string;
  weaponType?: string;
  weaponCount?: number;
  ammoIntactCount?: number;
  ammoDeflagratedCount?: number;
  garrison?: string;
  victim?: string;
  cvliType?: string;
  drugDetails?: string;
  conductedCount?: number;
  conductedSex?: string; // Mantido para compatibilidade, mas priorizaremos Profiles
  conductedProfiles?: string[];
  hasFlagrante?: string;
  photo?: string;
  vehicleDetails?: string;
  stolenDetails?: string;
  customType?: string;
}

export interface ReportEntry {
  id: string;
  type: 'BO' | 'TCO';
  number?: string;
  natures: string[];
  conduzidos: {
    masculino: number;
    feminino: number;
    menor_infrator: number;
  };
}

export interface DailySummary {
  id: string;
  date: string;
  counts: Record<string, number>;
  conduzidos: {
    masculino: number;
    feminino: number;
    menor_infrator: number;
  };
  entries?: ReportEntry[];
  reportedBy: string;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<IncidentStatus, number>;
}

export interface UserProfile {
  id: string;
  police_id: string;
  is_approved: boolean;
  is_admin: boolean;
  created_at: string;
}
