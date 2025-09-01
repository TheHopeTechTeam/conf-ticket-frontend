import { useState } from "react";
import { Select } from "../Select/Select";
import { PAYMENT_TYPES } from "../../../constants/payment";
import './PaymentSelect.scss';

interface PaymentSelectProps {
    value?: string;
    className?: string;
    onChange?: (value: string) => void;
}

export const PaymentSelect: React.FC<PaymentSelectProps> = ({ value = '',
    className = '', onChange }) => {
    const [selectedPayment, setSelectedPayment] = useState(value);

    return (
        <div className={`payment-select-container ${className}`}>
            <p className="payment-select-title">請選擇付款方式</p>
            <Select
                options={[
                    { id: PAYMENT_TYPES.CREDIT_CARD, label: '信用卡' },
                    { id: PAYMENT_TYPES.APPLE_PAY, label: 'Apple Pay' },
                    { id: PAYMENT_TYPES.GOOGLE_PAY, label: 'Google Pay' },
                    { id: PAYMENT_TYPES.SAMSUNG_PAY, label: 'Samsung Pay' },
                ]}
                value={selectedPayment}
                onChange={(value: string) => {
                    setSelectedPayment(value);
                    onChange && onChange(value);
                }}
                placeholder="請選擇付款方式"
            />
        </div>
    );
}