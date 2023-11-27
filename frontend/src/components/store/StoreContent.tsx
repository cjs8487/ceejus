import { Route, Routes } from 'react-router-dom';
import Store from '../../routes/store/Store';

const StoreContent = () => {
    return (
        <div className="bg-white p-2">
            <Routes>
                <Route index element={<div>store landing page</div>} />
                <Route path=":user" element={<Store />} />
            </Routes>
        </div>
    );
};

export default StoreContent;
