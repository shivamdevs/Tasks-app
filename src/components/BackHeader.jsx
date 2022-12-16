import { useLocation, useNavigate } from 'react-router-dom';

import css from './../styles/Backheader.module.css';

function BackHeader({children = "", label = ""}) {
    const navigate = useNavigate();
    const location = useLocation();
    const goBack = () => {
        if (location.key !== "default") {
            navigate(-1);
        } else {
            navigate("/");
        }
    };
    return (
        <header className={css.header}>
            <button className={css.navigate} onClick={goBack}>
                {location.key !== "default" && <i className="fas fa-arrow-left"></i>}
                {location.key === "default" && <i className="fas fa-home"></i>}
            </button>
            <span className='text'>{children || label || ""}</span>
        </header>
    );
};

export default BackHeader;