import { InvoiceDto } from "./appointment/invoices/invoice";
import { PositionDto } from "./employee/positions/position";
import { Allmedicalrecords} from "./patient/medicalrecords/medicalrecord";
import { PatientDto } from "./patient/patients/patient";
import { SurgeryDto } from "./patient/surgeries/surgery";

export interface Appointment {
    id: number;
    appointmentDate: string;
    createdAt: string;
    status: AppointmentStatus;
    notes: string;
    patientId: number;
    patient: PatientDto;
    doctorDepartmentId: number;
    doctorDepartment: DoctorDepartment;
    invoice: InvoiceDto;
    medicalRecord: Allmedicalrecords;
}


export interface CreateAppointmentDTO {
  appointmentDate: string; // ISO 8601 format e.g., "2025-07-01T14:30:00"
  notes: string;
  patientId: number;
  doctorDepartmentId: number;
}

export interface UpdateAppointmentDTO extends CreateAppointmentDTO {
  id: number;
}

export interface AppointmentDetails {
  id: number;
  patientId: number;
  name: string;
  prescriptions: string[][]; // array of prescription medication names per prescription
  departmentName: string;
  doctorName: string;
  appointmentDate: string;
  notes: string;
  status: string;
}

export enum AppointmentStatus {
    Scheduled = 0,
    Completed = 1,
    Cancelled = 2,
    NoShow = 3
}


export enum PaymentMethod {
    Cash = 0,
    CreditCard = 1,
    Wallet = 2,
    Insurance = 3,
    Other = 4
}

export interface Clinic {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    isActive: boolean;
    ownerId: string | null;
    owner: AppUser | null;
    departments: Department[];
}

export interface ClinicViewDTO {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  ownerName?: string;
  departments: string[];
}

export interface CreateClinicDTO {
  name: string;
  address?: string;
  phone?: string;
  ownerId?: string;
}

export interface UpdateClinicDTO extends CreateClinicDTO {
  id: number;
}


export interface Department {
    id: number;
    name: string;
    clinicId: number;
    clinic: Clinic;
    isActive: boolean;
    departmentDoctors: DoctorDepartment[];
}


export interface DepartmentViewDTO {
  id: number;
  name: string;
  clinicName: string;
  doctorNames: DoctorInDepartmentViewDTO[];
}

export interface DoctorInDepartmentViewDTO {
  id: number;
  fullName: string;
  specialization: string;
}

export interface CreateDepartmentDTO {
  name: string;
  clinicId: number;
}

export interface UpdateDepartmentDTO extends CreateDepartmentDTO {
  id: number;
}




export interface Doctor {
    id: number;
    name: string;
    specialization: string;
    phoneNumber: string;
    isActive: boolean;
    isDeleted: boolean;
    startDate: string;
    endDate: string | null;
    appUserId: string | null;
    appUser: AppUser | null;
    doctorDepartments: DoctorDepartment[];
    surgeries: SurgeryDto[];
}

export interface LoginDTO {
  usernameoremail: string;
  loginPassword: string;
}

export interface RefreshTokenDTO {
  userName: string;
  refreshToken: string;
}

export interface CreateDoctorDTO {
  name: string;
  specialization: string;
  phoneNumber: string;
  startDate: string; // ISO string (yyyy-mm-dd)
  appUserId: string;
}

export interface UpdateDoctorDTO {
  id: number;
  name: string;
  specialization: string;
  phoneNumber: string;
}

export interface CreateEmployeeDTO {
  name: string;
  phoneNumber: string;
  salary: number;
  appUserId?: string;
  positionId: number;
}

export interface UpdateEmployeeDTO {
  id: number;
  name: string;
  phoneNumber: string;
  salary: number;
  positionId: number;
  endDate?: string;
}



export interface DoctorDepartment {
    id: number;
    percentage: number;
    departmentId: number;
    department: Department;
    doctorId: number;
    doctor: Doctor;
    appointments: Appointment[];
}





export interface Employee {
    id: number;
    name: string;
    phoneNumber: string;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
    isDeleted: boolean;
    salary: number;
    appUserId: string | null;
    appUser: AppUser | null;
    positionId: number;
    position: PositionDto;
}




export interface InventoryCategory {
    id: number;
    name: string;
    createdAt: string;
    isDeleted: boolean;
    clinic: Clinic;
    inventoryItems: InventoryItem[] | null;
}


export interface InventoryItem {
    id: number;
    name: string;
    description: string | null;
    purchasePrice: number;
    stockQuantity: number;
    expirationDate: string;
    createdAt: string | null;
    updatedAt: string | null;
    inventoryCategoryId: number;
    inventoryCategory: InventoryCategory;
}


export interface InventoryTransaction {
    id: number;
    quantity: number;
    description: string | null;
    date: string;
    transactionType: InventoryTransactionType;
    inventoryItemId: number;
    inventoryItem: InventoryItem;
    userId: string;
    handelUser: AppUser;
}

export enum InventoryTransactionType {
    Addition = 1,
    Deduction = 2,
    Adjustment = 3,
    Transfer = 4,
    Return = 5,
    Expiration = 6,
    Damage = 7,
    Purchase = 8,
    Other = 9
}






export enum Gender {
    male = 0,
    female = 1
}








export interface Transaction {
    id: number;
    amount: number;
    date: string;
    updatedAt: string | null;
    description: string | null;
    type: TranscationType | null;
    appUser: AppUser;
}

export enum TranscationType {
    Income = 1,
    Expense = 2,
    Refund = 3,
    Other = 4
}
export interface TransactionCategory {
    id: number;
    name: string;
    clinic: Clinic;
    transactions: Transaction[] | null;
}

export interface AppUser extends IdentityUser {
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
    profilePicture: string | null;
    employee: Employee | null;
    doctor: Doctor | null;
    refreshToken: string;
    refreshTokenExpiryDate: string;
}


export interface IdentityUser {

}
