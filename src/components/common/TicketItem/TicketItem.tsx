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
}

export const TicketItem: React.FC<TicketItemProps> = ({
  ticket,
  quantity,
  mode,
  onQuantityChange,
}) => {
  const handleQuantityChange = (newQuantity: number) => {
    onQuantityChange?.(ticket.id, newQuantity);
  };

  return (
    <div>
      <div className="booking-content-item">
        <div className="booking-content-item-left">
          <img
            src={ticket.image}
            alt={ticket.name}
            className={
              mode === MODE.EDIT ? 'edit-ticket-pic' : 'record-ticket-pic'
            }
          />
        </div>
        <div className="booking-content-item-right">
          <div className="ticket-info">
            <div className="ticket-info-title">
              <span
                className={mode === MODE.EDIT ? 'edit-title' : 'record-title'}
              >
                {ticket.name}
              </span>
              <span
                className={mode === MODE.EDIT ? 'edit-title' : 'record-title'}
              >
                ${ticket.price.toLocaleString()}
              </span>
              {ticket.caption && (
                <p className="ticket-info-remark">{ticket.caption}</p>
              )}
            </div>
            <ul className="ticket-info-list">
              {ticket.description.map((feature, index) => (
                <li key={index} className="ticket-info-content">
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
                      fill="#778793"
                    />
                  </svg>
                  <p>
                    {feature}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="ticket-quantity">
            {mode === MODE.EDIT ? (
              <QuantitySelector
                initialValue={quantity}
                onChange={handleQuantityChange}
              />
            ) : (
              <p>
                {quantity}張，小計${(quantity * ticket.price).toLocaleString()}
                元
              </p>
            )}
          </div>
        </div>
      </div>
      <ul className="ticket-info-list-mobile">
        {ticket.description.map((feature, index) => (
          <li key={index} className="ticket-info-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <circle cx="10.0003" cy="9.99935" r="3.33333" fill="#778793" />
            </svg>
            <p>
              {feature}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

