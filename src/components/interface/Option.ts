export interface Option {
  id: string;
  label: string;
}

export interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
