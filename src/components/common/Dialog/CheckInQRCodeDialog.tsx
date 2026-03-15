import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import Dialog from './Dialog';
import './CheckInQRCodeDialog.scss';

interface CheckInQRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  email: string;
  ticketId: string;
  hasInterpreter?: boolean;
  interpreterTicketId?: string;
}

export const CheckInQRCodeDialog: React.FC<CheckInQRCodeDialogProps> = ({
  isOpen,
  onClose,
  name,
  email,
  ticketId,
  hasInterpreter = false,
  interpreterTicketId,
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
  const qrCodeContent =
    hasInterpreter && interpreterTicketId
      ? `name: ${name}, email: ${email}, ticket id: ${ticketId.replace(/-/g, '')}, translator ticket id: ${interpreterTicketId.replace(/-/g, '')}`
      : `name: ${name}, email: ${email}, ticket id: ${ticketId.replace(/-/g, '')}`;

  const handleDownload = async () => {
    const container = document.getElementById('qrcode-download-container');
    if (!container) return;

    try {
      // 使用 html2canvas 將整個容器轉換為圖片
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高清晰度
        logging: false,
      });

      // 將 canvas 轉換為圖片
      const url = canvas.toDataURL('image/png');

      // 針對不同平台使用不同下載方式
      if (isMobile) {
        // iOS Safari 和部分行動瀏覽器：開啟新視窗讓使用者長按保存
        const newWindow = window.open();
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
                  img {
                    max-width: 100%;
                    height: auto;
                  }
                </style>
              </head>
              <body>
                <img src="${url}" alt="QR Code">
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      } else {
        // 桌面版：直接下載
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${ticketId}.png`;
        link.click();
      }
    } catch (error) {
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
          {hasInterpreter && (
            <div className="interpreter-alert-container">
              <div className="interpreter-alert-title">
                <img src="/images/ticket-alert-dot.svg" alt="" />
                <p>貼心提醒</p>
              </div>
              <div className="interpreter-alert-content">
                <p>您已加購口譯機。</p>
              </div>
            </div>
          )}

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
