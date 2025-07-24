// Re-export types from schemas
export type {
  User,
  CreateUser,
  Goal,
  CreateGoal,
  UpdateGoal,
  LogEntry,
  CreateLogEntry,
  Badge,
  BadgeDefinition,
  ApiResponse,
  Pagination,
} from "../schemas/index.js";

// Additional utility types
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface AppConfig {
  firebase: FirebaseConfig;
  useEmulator: boolean;
  emulatorHost: string;
  firestoreEmulatorPort: number;
  authEmulatorPort: number;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
}
