import React from 'react';
import { MODE } from '../../../constants/common';
import { TicketInfo } from '../../../constants/tickets';
import { QuantitySelector } from '../QuantitySelector/QuantitySelector';
import './TicketItem.scss';

interface TicketItemProps {
  ticket: TicketInfo;
  quantity: number;
  mode: string;
  onQuantityChange?: (id: string, quantity: number) => void;
  maxQuantity?: number; // 可選的最大數量覆寫
  disabled?: boolean; // 是否禁用選擇器
}

export const TicketItem: React.FC<TicketItemProps> = ({
  ticket,
  quantity,
  mode,
  onQuantityChange,
  maxQuantity,
  disabled = false,
}) => {
  const handleQuantityChange = (newQuantity: number) => {
    onQuantityChange?.(ticket.id, newQuantity);
  };

  // 如果被 disabled，則 max 設為 0；否則使用傳入的 maxQuantity 或 ticket.available
  const max = disabled ? 0 : (maxQuantity ?? ticket.available ?? 0);

  // 判斷是否為口譯機票券
  const isTranslationTicket =
    ticket.name.includes('口譯機') ||
    ticket.name.toLowerCase().includes('Interpretation');

  // 判斷單位（團體/雙人/口譯機使用「組」，其他使用「張」）
  const getTicketUnit = () => {
    const name = ticket.name;
    if (
      name.includes('團體') ||
      name.includes('雙人') ||
      name.includes('口譯機')
    ) {
      return '組';
    }
    return '張';
  };

  return (
    <div>
      {isTranslationTicket && mode === MODE.EDIT && (
        <>
          <hr className="ticket-divider" />
          <h2 className="ticket-section-title">加購項目</h2>
        </>
      )}
      <div className="booking-content-item">
        <div className="booking-content-item-left">
          <img
            src={ticket.image?.url}
            alt={ticket.image?.alt || 'Ticket Image'}
            className={
              mode === MODE.EDIT ? 'edit-ticket-pic' : 'record-ticket-pic'
            }
            loading="lazy"
          />
        </div>
        <div className="booking-content-item-right">
          <div className="ticket-info">
            <div className="ticket-info-title-container">
              <div className="ticket-info-title">
                <div className="ticket-info-title-name">
                  <span
                    className={`${mode === MODE.EDIT ? 'edit-title' : 'record-title'} ${!ticket.available ? 'sold-out-title' : ''}`}
                  >
                    {ticket.name}
                  </span>
                  <span
                    className={`${mode === MODE.EDIT ? 'edit-title' : 'record-title'} ${!ticket.available ? 'sold-out-title' : ''}`}
                  >
                    $
                    {(ticket.price * (ticket.bundleSize || 1)).toLocaleString()}
                  </span>
                </div>
                {!ticket.available && (
                  <p className="sold-out-alert">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M7.33337 11.334H8.66671V7.33398H7.33337V11.334ZM8.00004 6.00065C8.18893 6.00065 8.34737 5.93665 8.47538 5.80865C8.60337 5.68065 8.66715 5.52243 8.66671 5.33398C8.66626 5.14554 8.60226 4.98732 8.47471 4.85932C8.34715 4.73132 8.18893 4.66732 8.00004 4.66732C7.81115 4.66732 7.65293 4.73132 7.52537 4.85932C7.39782 4.98732 7.33382 5.14554 7.33337 5.33398C7.33293 5.52243 7.39693 5.68087 7.52537 5.80932C7.65382 5.93776 7.81204 6.00154 8.00004 6.00065ZM8.00004 14.6673C7.07782 14.6673 6.21115 14.4922 5.40004 14.142C4.58893 13.7918 3.88337 13.3169 3.28338 12.7173C2.68338 12.1178 2.20849 11.4122 1.85871 10.6007C1.50893 9.7891 1.33382 8.92243 1.33337 8.00065C1.33293 7.07887 1.50804 6.21221 1.85871 5.40065C2.20937 4.5891 2.68426 3.88354 3.28338 3.28398C3.88249 2.68443 4.58804 2.20954 5.40004 1.85932C6.21204 1.5091 7.07871 1.33398 8.00004 1.33398C8.92137 1.33398 9.78804 1.5091 10.6 1.85932C11.412 2.20954 12.1176 2.68443 12.7167 3.28398C13.3158 3.88354 13.7909 4.5891 14.142 5.40065C14.4932 6.21221 14.668 7.07887 14.6667 8.00065C14.6654 8.92243 14.4903 9.7891 14.1414 10.6007C13.7925 11.4122 13.3176 12.1178 12.7167 12.7173C12.1158 13.3169 11.4103 13.792 10.6 14.1427C9.78982 14.4933 8.92315 14.6682 8.00004 14.6673ZM8.00004 13.334C9.48893 13.334 10.75 12.8173 11.7834 11.784C12.8167 10.7507 13.3334 9.48954 13.3334 8.00065C13.3334 6.51176 12.8167 5.25065 11.7834 4.21732C10.75 3.18398 9.48893 2.66732 8.00004 2.66732C6.51115 2.66732 5.25004 3.18398 4.21671 4.21732C3.18337 5.25065 2.66671 6.51176 2.66671 8.00065C2.66671 9.48954 3.18337 10.7507 4.21671 11.784C5.25004 12.8173 6.51115 13.334 8.00004 13.334Z"
                        fill="#EE1B0A"
                      />
                    </svg>
                    已售罄
                  </p>
                )}
              </div>
            </div>
            <ul className="ticket-info-list">
              {ticket.caption && (
                <li
                  className={`ticket-info-remark ${!ticket.available ? 'sold-out-title' : ''}`}
                >
                  ※{ticket.caption}
                </li>
              )}
              {ticket.description.map((feature, index) => (
                <li
                  key={index}
                  className={`ticket-info-content ${!ticket.available ? 'sold-out-content' : ''}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <circle
                      cx="10.0003"
                      cy="9.99935"
                      r="3.33333"
                      fill={!ticket.available ? '#C5CCD1' : '#778793'}
                    />
                  </svg>
                  <p>{feature.bulletpoint}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="ticket-quantity">
            {mode === MODE.EDIT ? (
              <div className="ticket-quantity-content">
                <QuantitySelector
                  max={max}
                  initialValue={quantity}
                  onChange={handleQuantityChange}
                />
                {!ticket.available && (
                  <p className="sold-out-alert-mobile">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M7.33337 11.334H8.66671V7.33398H7.33337V11.334ZM8.00004 6.00065C8.18893 6.00065 8.34737 5.93665 8.47538 5.80865C8.60337 5.68065 8.66715 5.52243 8.66671 5.33398C8.66626 5.14554 8.60226 4.98732 8.47471 4.85932C8.34715 4.73132 8.18893 4.66732 8.00004 4.66732C7.81115 4.66732 7.65293 4.73132 7.52537 4.85932C7.39782 4.98732 7.33382 5.14554 7.33337 5.33398C7.33293 5.52243 7.39693 5.68087 7.52537 5.80932C7.65382 5.93776 7.81204 6.00154 8.00004 6.00065ZM8.00004 14.6673C7.07782 14.6673 6.21115 14.4922 5.40004 14.142C4.58893 13.7918 3.88337 13.3169 3.28338 12.7173C2.68338 12.1178 2.20849 11.4122 1.85871 10.6007C1.50893 9.7891 1.33382 8.92243 1.33337 8.00065C1.33293 7.07887 1.50804 6.21221 1.85871 5.40065C2.20937 4.5891 2.68426 3.88354 3.28338 3.28398C3.88249 2.68443 4.58804 2.20954 5.40004 1.85932C6.21204 1.5091 7.07871 1.33398 8.00004 1.33398C8.92137 1.33398 9.78804 1.5091 10.6 1.85932C11.412 2.20954 12.1176 2.68443 12.7167 3.28398C13.3158 3.88354 13.7909 4.5891 14.142 5.40065C14.4932 6.21221 14.668 7.07887 14.6667 8.00065C14.6654 8.92243 14.4903 9.7891 14.1414 10.6007C13.7925 11.4122 13.3176 12.1178 12.7167 12.7173C12.1158 13.3169 11.4103 13.792 10.6 14.1427C9.78982 14.4933 8.92315 14.6682 8.00004 14.6673ZM8.00004 13.334C9.48893 13.334 10.75 12.8173 11.7834 11.784C12.8167 10.7507 13.3334 9.48954 13.3334 8.00065C13.3334 6.51176 12.8167 5.25065 11.7834 4.21732C10.75 3.18398 9.48893 2.66732 8.00004 2.66732C6.51115 2.66732 5.25004 3.18398 4.21671 4.21732C3.18337 5.25065 2.66671 6.51176 2.66671 8.00065C2.66671 9.48954 3.18337 10.7507 4.21671 11.784C5.25004 12.8173 6.51115 13.334 8.00004 13.334Z"
                        fill="#EE1B0A"
                      />
                    </svg>
                    已售罄
                  </p>
                )}
              </div>
            ) : (
              <p>
                {quantity}
                {getTicketUnit()}，小計$
                {(
                  quantity *
                  ticket.price *
                  (ticket.bundleSize || 1)
                ).toLocaleString()}
                元
              </p>
            )}
          </div>
        </div>
      </div>
      <ul className="ticket-info-list-mobile">
        {ticket.caption && (
          <li
            className={`ticket-info-remark ${!ticket.available ? 'sold-out-title' : ''}`}
          >
            ※{ticket.caption}
          </li>
        )}
        {ticket.description.map((feature, index) => (
          <li
            key={index}
            className={`ticket-info-content ${!ticket.available ? 'sold-out-content' : ''}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <circle
                cx="10.0003"
                cy="9.99935"
                r="3.33333"
                fill={!ticket.available ? '#C5CCD1' : '#778793'}
              />
            </svg>
            <p>{feature.bulletpoint}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
