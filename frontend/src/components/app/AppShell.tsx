import { useContext } from 'react';
import AppBar from './AppBar';
import { Footer } from './Footer';
import MainContent from './MainContent';
import Navbar from './Navbar';
import { UserContext } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const AppShell = () => {
    const { loggedIn } = useContext(UserContext).state;
    const navigate = useNavigate();

    if (!loggedIn) {
        navigate('/login');
        return null;
    }
    return (
        <div className="flex h-full grow flex-col">
            <div className="flex grow">
                <Navbar />
                <div className="flex grow flex-col">
                    <AppBar />
                    <MainContent />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AppShell;
