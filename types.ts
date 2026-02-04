
export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

export interface User {
  username: string;
  role: UserRole;
  name: string;
}

export enum DeadlineStatus {
  ACTIVE = 'ACTIVE',
  WARNING = 'WARNING',
  EXPIRED = 'EXPIRED'
}

export enum Category {
  PERSONNEL = 'PERSONNEL',
  VEHICLE = 'VEHICLE',
  CORPORATE = 'CORPORATE',
  SITE = 'SITE'
}

export enum ActionPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  CRITICAL = 'CRITICAL'
}

export enum ActionStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  POSTPONED = 'POSTPONED'
}

export enum SiteStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED'
}

export enum DocStatus {
  MISSING = 'MISSING',
  OK = 'OK',
  EXPIRING = 'EXPIRING'
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  assignedTo?: string;
}

export interface ActionGroup {
  id: string;
  title: string;
  category: Category;
  priority: ActionPriority;
  suggestedDate: string;
  involvedItems: { id: string, name: string, dueDate: string, status: DeadlineStatus }[];
  tasks: Task[];
  status: ActionStatus;
  notes?: string;
  riskImpact: number;
}

export interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  status: DeadlineStatus;
  category: Category;
  description: string;
  recurrence?: 'NONE' | 'MONTHLY' | 'YEARLY';
  owner?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  taxCode: string;
  role: string;
  contract: string;
  deadlines: Deadline[];
  isFitForWork: boolean;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  type: string;
  assignedTo?: string;
  deadlines: Deadline[];
  isStreetLegal: boolean;
}

export interface CorporateDocument {
  id: string;
  title: string;
  category: string;
  version: string;
  expiryDate: string;
  tags: string[];
  status: DeadlineStatus;
  fileData?: string;
  fileName?: string;
}

export interface AdminProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

export interface SAL {
  id: string;
  title: string;
  amount: number;
  date: string;
  isPaid: boolean;
}

export interface Subcontractor {
  id: string;
  name: string;
  amount: number;
  posStatus: DocStatus;
  attachmentsStatus: DocStatus;
}

export interface ConstructionSite {
  id: string;
  name: string;
  client: string;
  address: string;
  status: SiteStatus;
  totalAmount: number;
  publicGroundOccupation: { active: boolean; expiryDate?: string };
  designer?: string;
  startDate: string;
  endDate?: string;
  docs: {
    dnl: DocStatus;
    cartello: DocStatus;
    contratto: DocStatus;
    docIdentita: DocStatus;
    certificatoQuadro: DocStatus;
    analisiRifiuti: DocStatus;
    formulariDiscarica: DocStatus;
    fineLavoriIdrica: DocStatus;
    fineLavoriElettrica: DocStatus;
    posAppaltatrice: DocStatus;
    psc: DocStatus;
    sciaCila: DocStatus;
  };
  subcontractors: Subcontractor[];
  salHistory: SAL[];
}
