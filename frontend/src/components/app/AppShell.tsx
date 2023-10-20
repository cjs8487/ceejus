import { useContext } from 'react';
import AppBar from './AppBar';
import { Footer } from './Footer';
import MainContent from './MainContent';
import Navbar from './Navbar';
import { UserContext } from '../../contexts/UserContext';
import { useLocation, useNavigate } from 'react-router-dom';

const AppShell = () => {
    const { loggedIn } = useContext(UserContext).state;
    const location = useLocation();
    const navigate = useNavigate();

    if (!loggedIn && location.pathname !== '/s') {
        navigate('/login');
        return null;
    }
    return (
        <div className="flex h-full flex-col">
            <div className="flex h-full">
                <Navbar />
                <div className="flex h-full w-full flex-col">
                    <AppBar />
                    <MainContent />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AppShell;
