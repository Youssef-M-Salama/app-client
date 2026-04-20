import authStyles from '../../styles/auth/auth.module.css'

export default function AuthLayout({ children }) {
    return (
        <div className={authStyles.container}>
            <div className={authStyles.card}>
                <div className={authStyles.topBar}>
                    <div className={authStyles.logo}>
                        <img src="/logo-black.png" alt="" className={authStyles.logoImg} />
                    </div>
                    <button className={authStyles.backButton}>
                        <i className="fa-solid fa-circle-chevron-left"></i>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}