import { Route, Routes } from 'react-router-dom';
import Store from '../../routes/store/Store';
import StoreHome from '../../routes/store/StoreHome';

const StoreContent = () => {
    return (
        <div className="bg-white p-2">
            <Routes>
                <Route index element={<StoreHome />} />
                <Route path=":user" element={<Store />} />
            </Routes>
        </div>
    );
};

export default StoreContent;
