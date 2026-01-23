
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

export type RequestType = 'http' | 'graphql' | 'websocket';

export type NavTab = 'collections' | 'history';

export interface KeyValue {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface EnvVariable {
  key: string;
  value: string;
  enabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvVariable[];
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'oauth2';
  basic?: { username: string; password: string };
  bearer?: { token: string };
  oauth2?: { accessToken: string };
}

export interface RequestData {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValue[];
  headers: KeyValue[];
  auth: AuthConfig;
  bodyType: 'none' | 'json' | 'form-data';
  body: string;
  timestamp?: number;
  requestType?: RequestType;
}

export interface Collection {
  id: string;
  name: string;
  requests: RequestData[];
}

export interface ApiResponse {
  status: number;
  statusText: string;
  time: number;
  size: string;
  headers: Record<string, string>;
  data: any;
  isImage?: boolean;
}

export interface RequestRunResult {
  requestId: string;
  name: string;
  method: HttpMethod;
  status: number;
  statusText: string;
  time: number;
  success: boolean;
  error?: string;
}

export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: string;
}

export interface ConsoleLog {
  id: string;
  timestamp: number;
  type: 'info' | 'error' | 'request' | 'response';
  message: string;
  details?: any;
}

export interface AppState {
  activeRequestId: string;
  openRequestIds: string[];
  collections: Collection[];
  responses: Record<string, ApiResponse | null>;
  history: RequestData[];
  environments: Environment[];
  activeEnvironmentId: string | null;
  activeNavTab: NavTab;
  cookies: Cookie[];
  logs: ConsoleLog[];
}
