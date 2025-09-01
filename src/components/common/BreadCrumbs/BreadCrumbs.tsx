import { useNavigate } from 'react-router-dom';
import './BreadCrumbs.scss';
import { ROUTES } from '../../../constants/routes';


export const BreadCrumbs = () => {
    const navigate = useNavigate();

    return (
        <div className='bread-crumbs' >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M17.5461 9.1807L16.0656 7.7002L9.76562 14.0002L16.0656 20.3002L17.5461 18.8197L12.7371 14.0002L17.5461 9.1807Z" fill="#3C5464" />
            </svg>
            <p className='bread-crumbs-text' onClick={() => navigate(ROUTES.HOME)}>返回票券系統</p>
        </div>
    );
};
