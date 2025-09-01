import React from 'react';
import Dialog from './Dialog';

interface UserTermsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const UserTermsDialog: React.FC<UserTermsDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title1="The Hope Conference"
      title2="售票與帳號使用者條款"
      confirmText="我同意"
      cancelText="取消"
      onConfirm={onConfirm}
      onCancel={onCancel}
      requireScrollToBottom={true}
    >
      <div>
        <p className="font-size18 mb-4 font-weight600">
          第1條（目的與適用範圍）
        </p>
        <p>
          本條款旨在保障 The Hope
          教會線上購票系統（以下簡稱「本系統」）之安全與使用流程順暢，規範使用者於本系統註冊
          The Hope Conference
          ID（以下簡稱「本ID」）並進行購票、登入與操作時，所應遵守之事項、權利與義務。
        </p>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">第2條（用詞定義）</p>
        <ul className="dialog-content-list">
          <li>
            <span className="number">1.</span>
            本ID：使用者於本系統註冊取得之帳號，用於登入及購票。
          </li>
          <li>
            <span className="number">2.</span>
            使用者：完成本ID註冊程序之自然人。
          </li>
          <li>
            <span className="number">3.</span>
            未成年人：未滿登記時所在地法定成年年齡者（本條款指18歲以下）。
          </li>
          <li>
            <span className="number">4.</span>
            家長同意：未成年人註冊本ID或購票時，須由法定代理人（家長）同意本條款之適用。
          </li>
        </ul>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">第3條（同意與註冊）</p>
        <ul className="dialog-content-list">
          <li>
            <span className="number">1.</span>
            使用者或其家長於註冊頁面閱覽並同意本條款後，方可完成本ID申請與購票程序。
          </li>
          <li>
            <span className="number">2.</span>
            若註冊者為未成年人，須經家長同意；若未經同意而註冊，視為家長已同意並承擔相關責任。
          </li>
        </ul>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">
          第4條（使用目的與範圍）
        </p>
        <ul className="dialog-content-list">
          <li>
            <span className="number">1.</span>
            本ID僅限於購票及登入本系統之使用，不得作其他用途（除非另行公告）。
          </li>
          <li>
            <span className="number">2.</span>
            本售票平台對所有人開放，但未滿18歲者需家長同意才能購票。
          </li>
        </ul>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">
          第5條（帳號與資料管理）
        </p>
        <ul className="dialog-content-list">
          <li>
            <span className="number">1.</span>
            使用者應設定安全、不易被猜測之帳號與密碼，並妥善保管，不得轉讓或提供他人使用。
          </li>
          <li>
            <span className="number">2.</span>
            如發現帳號遭盜用，應立即更改密碼或通知系統管理者；因使用者自身疏失造成之損害，The
            Hope 概不負責。
          </li>
          <li>
            <span className="number">3.</span>
            購票需註冊帳戶並提供正確個人資料。禁止帳號轉讓，否則平台得停權或取消訂單。
          </li>
        </ul>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">第6條（票券規定）</p>
        <ul className="dialog-content-list">
          <li>
            <span className="number">1.</span>
            本平台採電子票券（含 QR code），並透過 Email 發送。
          </li>
          <li>
            <span className="number">2.</span>
            票券採實名制，禁止截圖或非官方方式轉發，僅可依官方公告方式以系統進行分票、取票。
          </li>
          <li>
            <span className="number">3.</span>
            每張票僅能使用一次，完成 Check-in 後需透過 Conference App
            進行實名驗證。
          </li>
        </ul>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">
          第7條（付款與契約成立）
        </p>
        <ul className="dialog-content-list">
          <li>
            <span className="number">1.</span>
            可使用之支付方式：信用卡、Apple Pay、Google Pay、Samsung Pay
            等數位支付。
          </li>
          <li>
            <span className="number">2.</span>
            購票契約於付款完成且使用者收到確認信時成立。
          </li>
        </ul>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">第8條（退票與換票）</p>
        <ul className="dialog-content-list">
          <li>
            <span className="number">1.</span>
            退票需收取 10% 手續費。
          </li>
          <li>
            <span className="number">2.</span>
            活動開始日前 10 天內不得退票（例：活動於 4/30 開始，最後退票期限為
            4/19 23:59）。
          </li>
          <li>
            <span className="number">3.</span>
            若活動取消或延期，平台將提供全額退票，且免收手續費。
          </li>
        </ul>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">第9條（禁止行為）</p>
        <p>使用者不得利用本系統或本ID進行以下行為：</p>
        <ul className="dialog-content-list">
          <li>
            <span className="number">1.</span>
            違法、侵害他人權益、公序良俗或散布不當言論。
          </li>
          <li>
            <span className="number">2.</span>
            未經授權之干擾系統、破壞安全、或進行未授權存取。
          </li>
          <li>
            <span className="number">3.</span>
            偽造票券、搶票程式、散布惡意程式或其他不當手段。
          </li>
          <li>
            <span className="number">4.</span>
            冒用他人身分或使用虛假資訊註冊。
          </li>
        </ul>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">
          第10條（違規處理與責任限制）
        </p>
        <p>使用者不得利用本系統或本ID進行以下行為：</p>
        <ul className="dialog-content-list">
          <li>
            <span className="number">1.</span>
            若使用者違反本條款，The Hope
            得暫停或終止其ID使用權限，並得取消相關訂單。
          </li>
          <li>
            <span className="number">2.</span>
            因系統維護或故障導致服務中斷，The Hope
            將盡力提前通知與搶修，但對因此造成之損害不負賠償責任。
          </li>
        </ul>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">第11條（智慧財產權）</p>
        <p>
          使用者於平台上傳之內容（如文字、照片等），平台有使用、修改及發布之權利。
        </p>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">
          第12條（個人資料保護）
        </p>
        <p>
          The Hope
          將依據中華民國個人資料保護法及教會隱私政策，妥善處理與保護使用者個人資料。
        </p>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">
          第13條（條款更新與通知）
        </p>
        <p>
          The Hope
          得於必要時修訂本條款，並於官網公告或註冊頁面提示後生效；使用者持續使用本系統即視為同意修訂後條款。
        </p>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">
          第14條（準據法與管轄法院）
        </p>
        <p>
          本條款適用中華民國法律。如有爭議，雙方同意以臺灣臺北地方法院為第一審專屬管轄法院。
        </p>
      </div>
      <div>
        <p className="font-size18 mb-4 font-weight600">附則</p>
        <p>本條款自公告日起生效，除另有說明外，長期有效。</p>
      </div>
    </Dialog>
  );
};
