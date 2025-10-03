import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { WarnDialog } from '../components/common/Dialog/WarnDialog';
import { errorHandler } from '../utils/errorHandler';

interface ErrorContextType {
  showError: (message: string) => void;
  hideError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const showError = (message: string) => {
    setErrorMessage(message);
    setIsOpen(true);
  };

  const hideError = () => {
    setIsOpen(false);
    setErrorMessage('');
  };

  // 註冊全局錯誤處理器
  useEffect(() => {
    errorHandler.setCallback(showError);
  }, []);

  const value = {
    showError,
    hideError,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <WarnDialog isOpen={isOpen} onClose={hideError} message={errorMessage} />
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
