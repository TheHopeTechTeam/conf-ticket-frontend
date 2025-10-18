import React from 'react';
import { EXTRA_ROUTES } from '../../../constants/routes';
import { PrivacyPolicyDialog, UserTermsDialog } from '../Dialog';
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
          <img src="/images/footer-logo.svg" alt="" className="footer-logo" />
          <div className="contact-info">
            <div className="contact-info-right">
              <div className="contact-method">
                <p>聯繫我們</p>
                <div className="contact-method-content">
                  <a
                    href="https://lin.ee/zVP7wI8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Line
                  </a>
                  <a href="mailto:conference@thehope.co">Email</a>
                </div>
              </div>
              <div className="contact-method">
                <p>追蹤我們</p>
                <div className="follow-method-content">
                  <img
                    src="/images/ig-icon.svg"
                    alt="instagram"
                    onClick={() =>
                      window.open(EXTRA_ROUTES.INSTAGRAM, '_blank')
                    }
                    className="cursor-pointer"
                  />
                  <img
                    src="/images/fb-icon.svg"
                    alt="facebook"
                    onClick={() => window.open(EXTRA_ROUTES.FACEBOOK, '_blank')}
                    className="cursor-pointer"
                  />
                  <img
                    src="/images/youtube-icon.svg"
                    alt="youtube"
                    onClick={() => window.open(EXTRA_ROUTES.YOUTUBE, '_blank')}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="contact-info-left">
              <p>主辦單位：好故事設計有限公司</p>
              <p>統一編號：24758829</p>
            </div>
          </div>
        </div>
        <div className="footer-info">
          <p>© thehope.co all rights reserved.</p>
          <div className="footer-links">
            <p
              className="cursor-pointer"
              onClick={() => setPrivacyPolicyDialogOpen(true)}
            >
              隱私權保護政策
            </p>
            <p
              className="cursor-pointer"
              onClick={() => setUserTermsDialogOpen(true)}
            >
              使用者條款
            </p>
          </div>
        </div>
      </footer>
      <UserTermsDialog
        isOpen={isUserTermsDialogOpen}
        onClose={() => setUserTermsDialogOpen(false)}
        isShowButton={false}
      />
      <PrivacyPolicyDialog
        isOpen={isPrivacyPolicyDialogOpen}
        onClose={() => setPrivacyPolicyDialogOpen(false)}
        isShowButton={false}
      />
    </>
  );
};
