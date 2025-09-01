import React from 'react';
import Dialog from '../Dialog/Dialog';
import './Footer.scss';

export const Footer: React.FC = () => {
  const [isUserTermsDialogOpen, setUserTermsDialogOpen] = React.useState(false);
  const [isPrivacyPolicyDialogOpen, setPrivacyPolicyDialogOpen] =
    React.useState(false);

  // 組件邏輯
  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <img
            src="/src/assets/images/footer-logo.svg"
            alt=""
            className="footer-logo"
          />
          <div className="contact-info">
            <div className="contact-method">
              <p>聯繫我們</p>
              <p>info@thehope.co</p>
            </div>
            <div className="contact-method">
              <p>追蹤我們</p>
              <div>
                <img src="/src/assets/images/ig-icon.svg" alt="" />
                <img src="/src/assets/images/threads-icon.svg" alt="" />
                <img src="/src/assets/images/fb-icon.svg" alt="" />
                <img src="/src/assets/images/youtube-icon.png" alt="" />
                <img src="/src/assets/images/tiktok-icon.png" alt="" />
              </div>
            </div>
          </div>
        </div>
        <div className="footer-info">
          <p>© thehope.co all rights reserved.</p>
          <div className="footer-links">
            <p onClick={() => setPrivacyPolicyDialogOpen(true)}>
              隱私權保護政策
            </p>
            <p onClick={() => setUserTermsDialogOpen(true)}>使用者條款</p>
          </div>
        </div>
      </footer>
      <Dialog
        isShowButton={false}
        isOpen={isUserTermsDialogOpen}
        onClose={() => setUserTermsDialogOpen(false)}
        title1="使用者條款"
      >
        <div>
          <p>
            <strong>第1條（目的與適用範圍）</strong> 本條款旨在保障 The Hope
            教會線上購票系統（以下簡稱「本系統」）之安全與使用流程順暢，規範使用者於本系統註冊
            The Hope Conference
            ID（以下簡稱「本ID」）並進行購票、登入與操作時，所應遵守之事項、權利與義務。
          </p>

          <p>
            <strong>3.</strong>{' '}
            退票申請送出後，恕無法修改退票張數及取消退票申請，請務必於退票申請送出前，確認退票資料是否正確。
          </p>

          <p>
            <strong>4.</strong>{' '}
            退款方式：憑款扣除退票手續費，刷退至原刷卡購票之信用卡。信用卡退款時間依各大作業時間為準，建議於退票申請完成後，可留意當期或下期信用卡帳單。
          </p>

          <p>
            <strong>5.</strong>{' '}
            本系統票券分級退票者，本系統將依退票申請表上之聯絡方式通知申請人取回票券，若無法和申請人取得聯繫或無法送或取回票券共識者，本系統將不負票券保管或任何其他責任，所有責任與後果將由申請人自行負擔。
          </p>

          <p>
            <strong>6.</strong>{' '}
            當您確認本系統已收到您的退票申請資料，可於申請退票的5個工作天後至訂單查詢網絡或手機，訂單狀態將改為【個人因事辦理退票】，訂單狀態若無顯示，請聯必向本系統客服認證呈異確度，(聯繫電話)，道歉的
          </p>
        </div>
      </Dialog>
      <Dialog
        isShowButton={false}
        isOpen={isPrivacyPolicyDialogOpen}
        onClose={() => setPrivacyPolicyDialogOpen(false)}
        title1="隱私權保護政策"
      >
        <div>
          <p>
            <strong>2.</strong>{' '}
            憑票申請購票，回一書暨口罩接觸對效果或定全部恕兼，但右覺用暴標辦，或使用暫FUN、動滋券折抵等虛享優惠，則需依套畫承或電器申請提回，恕無法讓部份票券，請依相關公告說明辦理。
          </p>

          <p>
            <strong>3.</strong>{' '}
            退票申請送出後，恕無法修改退票張數及取消退票申請，請務必於退票申請送出前，確認退票資料是否正確。
          </p>

          <p>
            <strong>4.</strong>{' '}
            退款方式：憑款扣除退票手續費，刷退至原刷卡購票之信用卡。信用卡退款時間依各大作業時間為準，建議於退票申請完成後，可留意當期或下期信用卡帳單。
          </p>

          <p>
            <strong>5.</strong>{' '}
            本系統票券分級退票者，本系統將依退票申請表上之聯絡方式通知申請人取回票券，若無法和申請人取得聯繫或無法送或取回票券共識者，本系統將不負票券保管或任何其他責任，所有責任與後果將由申請人自行負擔。
          </p>

          <p>
            <strong>6.</strong>{' '}
            當您確認本系統已收到您的退票申請資料，可於申請退票的5個工作天後至訂單查詢網絡或手機，訂單狀態將改為【個人因事辦理退票】，訂單狀態若無顯示，請聯必向本系統客服認證呈異確度，(聯繫電話)，道歉的
          </p>
        </div>
      </Dialog>
    </>
  );
};
