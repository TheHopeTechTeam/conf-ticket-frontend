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
                <img
                  src="/src/assets/images/ig-icon.svg"
                  alt="instagram"
                  onClick={() => window.open(EXTRA_ROUTES.INSTAGRAM, '_blank')}
                  className="cursor-pointer"
                />
                <img
                  src="/src/assets/images/fb-icon.svg"
                  alt="facebook"
                  onClick={() => window.open(EXTRA_ROUTES.FACEBOOK, '_blank')}
                  className="cursor-pointer"
                />
                <img
                  src="/src/assets/images/youtube-icon.png"
                  alt="youtube"
                  onClick={() => window.open(EXTRA_ROUTES.YOUTUBE, '_blank')}
                  className="cursor-pointer"
                />
              </div>
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
