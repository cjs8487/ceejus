import AppBar from './AppBar';
import MainContent from './MainContent';
import Navbar from './Navbar';

const AppShell = () => {
    return (
        <div className="flex h-screen">
            <Navbar />
            <div className="flex h-full w-full flex-col">
                <AppBar />
                <MainContent />
            </div>
        </div>
    );
};

export default AppShell;
