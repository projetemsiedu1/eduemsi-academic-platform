import { ApiClient, ApiError } from './api-client';

export interface AcademicUser {
  username: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  campusId: number | null;
  campusNom: string | null;
}

export interface LoginResponse extends AcademicUser {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
}

export async function login(username: string, password: string, remember: boolean): Promise<LoginResponse> {
  const response = await ApiClient.post<LoginResponse>('/auth/login', { username: username.trim(), password });
  if (!response || typeof response.accessToken !== 'string' || !response.accessToken || !Number.isFinite(response.expiresIn) || response.expiresIn <= 0) {
    throw new ApiError('Réponse de connexion invalide.', 200, 'response');
  }
  try {
    ApiClient.setToken(response.accessToken, remember, response.expiresIn);
  } catch {
    ApiClient.clearToken();
    throw new Error('Votre navigateur bloque le stockage de session. Autorisez-le puis réessayez.');
  }
  return response;
}

export function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403 || error.status === 400) return 'Identifiant ou mot de passe incorrect. Veuillez réessayer.';
    if (error.kind === 'network') return 'Le serveur est injoignable. Vérifiez votre connexion et réessayez.';
    if (error.kind === 'timeout') return 'Le serveur met trop de temps à répondre. Veuillez réessayer.';
    if (error.status === 429) return 'Trop de tentatives. Patientez un instant avant de réessayer.';
    return 'Une erreur inattendue est survenue. Veuillez réessayer dans un instant.';
  }
  if (error instanceof Error && error.message.startsWith('Votre navigateur')) return error.message;
  return 'Une erreur inattendue est survenue. Veuillez réessayer dans un instant.';
}

const roleLabels: Record<string, string> = {
  ROLE_SUPER_ADMIN: 'Administrateur',
  ROLE_RESPONSABLE_FILIERE: 'Responsable de filière',
  ROLE_RESPONSABLE_PLANNING: 'Responsable planning',
  ROLE_RESPONSABLE_PFE: 'Responsable PFE',
  ROLE_RESPONSABLE_SCOLARITE: 'Responsable scolarité',
  ROLE_PROFESSEUR_PERMANENT: 'Professeur permanent',
  ROLE_PROFESSEUR_VACATAIRE: 'Professeur vacataire',
  ROLE_ETUDIANT: 'Étudiant',
};

export function roleLabel(role: string): string {
  return roleLabels[role] ?? 'Membre de la communauté EMSI';
}
