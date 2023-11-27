import AppBar from '../app/AppBar';
import StoreContent from './StoreContent';

const StoreShell = () => {
    return (
        <div className="flex h-full w-full grow flex-col">
            <AppBar />
            <StoreContent />
        </div>
    );
};

export default StoreShell;
