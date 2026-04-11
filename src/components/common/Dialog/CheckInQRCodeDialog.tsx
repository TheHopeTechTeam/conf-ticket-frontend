import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import Dialog from './Dialog';
import { formatRegistrationId, toRegistrationId } from '../../../utils/registrationId';
import './CheckInQRCodeDialog.scss';

interface CheckInQRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  email: string;
  ticketId: string;
  ticketName?: string;
  isAddon?: boolean;
}

export const CheckInQRCodeDialog: React.FC<CheckInQRCodeDialogProps> = ({
  isOpen,
  onClose,
  name,
  email,
  ticketId,
  ticketName = '',
  isAddon = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 組合 QR code 內容（純文字格式）
  const qrCodeContent = isAddon
    ? `name: ${name}, email: ${email}, translator ticket id: ${ticketId}`
    : `name: ${name}, email: ${email}, ticket id: ${ticketId}`;

  const handleDownload = async () => {
    const container = document.getElementById('qrcode-download-container');
    if (!container) return;

    // iOS Safari：window.open 必須在 async 之前同步呼叫，否則被 popup blocker 擋
    const newWindow = isMobile ? window.open() : null;

    try {
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      if (isMobile) {
        // iOS Safari：將圖片寫入預先開好的視窗，讓使用者長按保存
        const url = canvas.toDataURL('image/png');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>QR Code - ${ticketId}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: #f5f5f5;
                  }
                  img { max-width: 100%; height: auto; }
                </style>
              </head>
              <body><img src="${url}" alt="QR Code"></body>
            </html>
          `);
          newWindow.document.close();
        }
      } else {
        // 桌面版（含 macOS Safari）：用 Blob URL，Safari 不支援 data URL 的 download
        canvas.toBlob(blob => {
          if (!blob) return;
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `ticket-${ticketId}.png`;
          link.click();
          URL.revokeObjectURL(blobUrl);
        }, 'image/png');
      }
    } catch (error) {
      if (newWindow) newWindow.close();
      console.error('下載 QR Code 失敗:', error);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      isShowButton={false}
      showCloseButton={true}
    >
      <div className="checkin-qrcode-container">
        <div
          id="qrcode-download-container"
          className="qrcode-download-container"
        >
          <div className="qrcode-info">
            <p className="qrcode-info-ticket-name">{ticketName}</p>
            <p className="qrcode-info-user">
              {name}・報到序號 {formatRegistrationId(toRegistrationId(ticketId))}
            </p>
          </div>

          <div className="qrcode-wrapper">
            <QRCodeCanvas
              id="qrcode-canvas"
              value={qrCodeContent}
              size={isMobile ? 250 : 280}
              level="H"
            />
          </div>
        </div>

        <button className="qrcode-download-btn" onClick={handleDownload}>
          下載 QR Code
        </button>

        {isMobile && (
          <p className="qrcode-hint">
            點擊後將開啟新視窗，請長按圖片選擇「儲存圖片」
          </p>
        )}
      </div>
    </Dialog>
  );
};
