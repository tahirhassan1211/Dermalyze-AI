/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum InputMode {
  IMAGE = 'IMAGE',
  VOICE = 'VOICE',
  TEXT = 'TEXT',
}

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
}

export interface UserMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string; // 'PRIMARY_ADMIN' or a doctorId
  timestamp: string;
  text: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  pin: string;
  role: UserRole;
  specialty?: string;
  isAdminPrimary?: boolean;
}

export interface ConsultationRequest {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  timestamp: string;
  analysis: string;
  inputs: AnalysisInput;
  status: 'PENDING' | 'REVIEWED';
  doctorResponse?: {
    feedback: string;
    precautions: string;
    medicines: string;
    timestamp: string;
  };
}

export interface PatientRecord {
  id: string;
  userId: string;
  timestamp: string;
  analysis: string;
  doctorResponse?: {
    feedback: string;
    precautions: string;
    medicines: string;
    timestamp: string;
  };
}

export interface AnalysisInput {
  image?: {
    data: string; // base64
    mimeType: string;
  };
  voice?: {
    data: string; // base64
    mimeType: string;
  };
  text?: string;
}

export interface AnalysisResult {
  diagnosis: string;
  treatment: string;
  prevention: string;
  rawMarkdown: string;
}
