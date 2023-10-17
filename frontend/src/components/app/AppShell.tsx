import AppBar from './AppBar';
import { Footer } from './Footer';
import MainContent from './MainContent';
import Navbar from './Navbar';

const AppShell = () => {
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
