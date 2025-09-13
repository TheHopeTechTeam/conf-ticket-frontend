import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Loading } from '../components/common/Loading/Loading';

interface LoadingContextType {
    showLoading: (text?: string) => void;
    hideLoading: () => void;
    isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
    children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingText, setLoadingText] = useState<string>('載入中...');

    const showLoading = (text: string = '載入中...') => {
        setLoadingText(text);
        setIsLoading(true);
    };

    const hideLoading = () => {
        setIsLoading(false);
    };

    const value = {
        showLoading,
        hideLoading,
        isLoading,
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
            <Loading isVisible={isLoading} text={loadingText} />
        </LoadingContext.Provider>
    );
};

export const useLoading = (): LoadingContextType => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
