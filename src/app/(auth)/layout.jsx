import authStyles from '../../styles/auth/auth.module.css'

export default function AuthLayout({ children }) {
    return (
        <div className={authStyles.container}>
            <div className={authStyles.card}>
                {children}
            </div>
        </div>
    );
}