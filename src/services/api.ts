import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  metadata?: {
    sources?: string[];
    dataSource?: string;
    agent?: string;
    agentThoughts?: Array<{
      agent: string;
      thought: string;
      passedTo?: string;
    }>;
  };
}

export interface DataSource {
  name: string;
  type: 'gcs' | 'drive' | 'web';
  enabled: boolean;
  config?: Record<string, any>;
}

export interface Corpus {
  name: string;
  documentCount?: number;
  metadata?: Record<string, any>;
}

export interface CorpusInfo {
  name: string;
  documentCount: number;
  metadata: Record<string, any>;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Don't show errors for connection refused (backend not running)
        if (error.code === 'ERR_NETWORK' || error.message.includes('ERR_CONNECTION_REFUSED')) {
          // Silently fail - backend is not available
          console.warn('Backend API not available:', error.message);
          return Promise.reject(error);
        }
        
        if (error.response) {
          const message = (error.response.data as any)?.detail || error.message;
          toast.error(message || 'An error occurred');
        } else if (error.request) {
          // Only show network errors if it's not a connection refused
          console.warn('Network error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    // Get token from Firebase auth state
    const authState = localStorage.getItem('auth_token');
    return authState;
  }

  setAuthToken(token: string | null) {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Chat endpoints
  async sendChatMessage(message: string): Promise<ChatMessage> {
    const response = await this.api.post<{ content: string; metadata?: any }>('/chat', {
      message,
    });
    return {
      role: 'assistant',
      content: response.data.content,
      metadata: response.data.metadata,
    };
  }

  async sendAgentMessage(message: string, dataSource?: string): Promise<ChatMessage> {
    const response = await this.api.post<{ content: string; metadata?: any }>('/adk-chat', {
      message,
      data_source: dataSource,
    });
    return {
      role: 'assistant',
      content: response.data.content,
      metadata: response.data.metadata,
    };
  }

  // Auth endpoints
  async getUserInfo() {
    const response = await this.api.get('/auth/user');
    return response.data;
  }

  async getMFAStatus() {
    const response = await this.api.get<{ enabled: boolean; phoneNumber?: string }>('/auth/mfa/status');
    return response.data;
  }

  async setupMFA(phoneNumber: string) {
    const response = await this.api.post('/auth/mfa/setup', { phone_number: phoneNumber });
    return response.data;
  }

  async verifyMFACode(code: string) {
    const response = await this.api.post('/auth/mfa/verify', { code });
    return response.data;
  }

  // Data source endpoints
  async getDataSources(): Promise<DataSource[]> {
    const response = await this.api.get<DataSource[]>('/data-sources');
    return response.data;
  }

  async addDataSource(dataSource: Omit<DataSource, 'enabled'>): Promise<DataSource> {
    const response = await this.api.post<DataSource>('/data-sources', dataSource);
    return response.data;
  }

  async deleteDataSource(name: string): Promise<void> {
    await this.api.delete(`/data-sources/${name}`);
  }

  async toggleDataSource(name: string, enabled: boolean): Promise<DataSource> {
    const response = await this.api.patch(`/data-sources/${name}`, { enabled });
    return response.data;
  }

  // Corpus endpoints
  async getCorpora(): Promise<Corpus[]> {
    const response = await this.api.get<Corpus[]>('/corpora');
    return response.data;
  }

  async getCorpusInfo(name: string): Promise<CorpusInfo> {
    const response = await this.api.get<CorpusInfo>(`/corpus/${name}/info`);
    return response.data;
  }

  async deleteCorpus(name: string): Promise<void> {
    await this.api.delete(`/corpus/${name}`);
  }

  async syncDriveToGCS(): Promise<void> {
    await this.api.post('/sync-drive-to-gcs');
  }
}

export const apiService = new ApiService();

