export interface TicketInfo {
  ticketType: string;
  ticketCount: number;
  useDate: string;
  user?: Array<{
    id: string;
    email: string;
    name: string;
    gender: string | null;
    tel: string;
  }>;
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
