import React from 'react';
import './Loading.scss';

interface LoadingProps {
    isVisible?: boolean;
    text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
    isVisible = true,
    text = '載入中...'
}) => {
    if (!isVisible) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">{text}</p>
            </div>
        </div>
    );
};
