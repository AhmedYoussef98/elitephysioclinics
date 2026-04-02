export interface Condition {
  slug: string;
  title: string;
  description: string;
  category?: 'adult' | 'paediatric';
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Booking {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  conditionSlug: string;
  date: string;
  startTime: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface BookingWithCondition extends Booking {
  conditionTitle: string;
  endTime: string;
}

export interface BookingRequest {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  conditionSlug: string;
  date: string;
  startTime: string;
}

export interface UnavailableSlot {
  start_time: string;
  end_time: string;
  reason: string;
}

export interface BlockedDate {
  blocked_date: string;
}

export interface BookAppointmentResponse {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    bookingReference: string;
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    conditionSlug: string;
    conditionTitle: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  };
}

export interface ClinicHours {
  start: string;
  end: string;
}
