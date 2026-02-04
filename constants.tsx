
import { Employee, Vehicle, CorporateDocument, Category, DeadlineStatus, UserRole } from './types';

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    firstName: 'Mario',
    lastName: 'Rossi',
    taxCode: 'RSSMRA80A01H501U',
    role: 'Operaio Specializzato',
    contract: 'Indeterminato',
    isFitForWork: true,
    deadlines: [
      { id: 'd-1', title: 'Visita Medica Periodica', dueDate: '2024-06-15', status: DeadlineStatus.ACTIVE, category: Category.PERSONNEL, description: 'Visita medica di sorveglianza sanitaria' },
      { id: 'd-2', title: 'Formazione Sicurezza Specifica', dueDate: '2024-03-10', status: DeadlineStatus.WARNING, category: Category.PERSONNEL, description: 'Aggiornamento corso rischio alto' }
    ]
  },
  {
    id: 'emp-2',
    firstName: 'Laura',
    lastName: 'Bianchi',
    taxCode: 'BNCLRA85B41H501Z',
    role: 'Impiegata HR',
    contract: 'Determinato',
    isFitForWork: false,
    deadlines: [
      { id: 'd-3', title: 'Corso Antincendio', dueDate: '2024-01-20', status: DeadlineStatus.EXPIRED, category: Category.PERSONNEL, description: 'Rinnovo addetto antincendio' }
    ]
  }
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    plate: 'AB123CD',
    model: 'Fiat Ducato',
    type: 'Furgone',
    assignedTo: 'Mario Rossi',
    isStreetLegal: true,
    deadlines: [
      { id: 'd-4', title: 'Revisione Ministeriale', dueDate: '2024-05-30', status: DeadlineStatus.ACTIVE, category: Category.VEHICLE, description: 'Controllo periodico biennale' },
      { id: 'd-5', title: 'Bollo Auto', dueDate: '2024-03-15', status: DeadlineStatus.WARNING, category: Category.VEHICLE, description: 'Pagamento tassa automobilistica' }
    ]
  }
];

export const MOCK_DOCS: CorporateDocument[] = [
  {
    id: 'doc-1',
    title: 'DURC - Documento Regolarità Contributiva',
    category: 'Certificazioni',
    version: '2024.1',
    expiryDate: '2024-04-12',
    tags: ['INPS', 'INAIL'],
    status: DeadlineStatus.ACTIVE
  },
  {
    id: 'doc-2',
    title: 'Visura Camerale CCIAA',
    category: 'Amministrativo',
    version: '1.0',
    expiryDate: '2024-01-01',
    tags: ['Azienda', 'Legal'],
    status: DeadlineStatus.EXPIRED
  }
];
