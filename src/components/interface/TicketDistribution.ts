export interface TicketInfo {
  ticketType: string;
  ticketCount: number;
  useDate: string;
}

export interface RecipientInfo {
  id: string;
  email: string;
  isSelected: boolean;
  isEmailValid: boolean;
}

export interface DistributionFormData {
  recipients: RecipientInfo[];
}

export interface TicketDistributionProps {
  ticketInfo?: TicketInfo;
}