import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import './BreadCrumbs.scss';

interface BreadCrumbItem {
    label: string;
    path?: string;
}

export const BreadCrumbs = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const breadcrumbConfig: Record<string, BreadCrumbItem[]> = {
        [ROUTES.PROFILE]: [
            { label: '票券系統', path: ROUTES.HOME },
            { label: '個人檔案' }
        ],
        [ROUTES.BOOKING]: [
            { label: '票券系統', path: ROUTES.HOME },
            { label: '購買票券' }
        ],
        [ROUTES.TICKETS]: [
            { label: '票券系統', path: ROUTES.HOME },
            { label: '我的票券' }
        ],
        [ROUTES.PAYMENT]: [
            { label: '票券系統', path: ROUTES.HOME },
            { label: '購買票券', path: ROUTES.BOOKING },
            { label: '確認與付款' }
        ],
        [ROUTES.REFUND]: [
            { label: '票券系統', path: ROUTES.HOME },
            { label: '我的票券', path: ROUTES.TICKETS },
            { label: '確認退票資訊' }
        ],
        [ROUTES.TICKET_DISTRIBUTION]: [
            { label: '票券系統', path: ROUTES.HOME },
            { label: '我的票券', path: ROUTES.TICKETS },
            { label: '填寫取票者資訊' }
        ]
    };

    const currentBreadcrumbs = breadcrumbConfig[location.pathname] || breadcrumbConfig[ROUTES.HOME];

    return (
        <div className='bread-crumbs'>
            <div className='bread-crumbs-content'>
                {currentBreadcrumbs.map((item, index) => (
                    <span key={index} className='bread-crumbs-item'>
                        {item.path ? (
                            <span
                                className='bread-crumbs-link'
                                onClick={() => navigate(item.path!)}
                            >
                                {item.label}
                            </span>
                        ) : (
                            <span className='bread-crumbs-current'>{item.label}</span>
                        )}
                        {index < currentBreadcrumbs.length - 1 && (
                            <svg
                                className='bread-crumbs-separator'
                                xmlns="http://www.w3.org/2000/svg"
                                width="28"
                                height="28"
                                viewBox="0 0 28 28"
                                fill="none"
                            >
                                <path d="M10.4539 18.8193L11.9344 20.2998L18.2344 13.9998L11.9344 7.6998L10.4539 9.1803L15.2629 13.9998L10.4539 18.8193Z" fill="#3C5464" />
                            </svg>
                        )}
                    </span>
                ))}
            </div>
        </div>
    );
};

