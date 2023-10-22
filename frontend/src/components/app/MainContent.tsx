import { Route, Routes } from 'react-router-dom';
import Config from '../../routes/config/Config';

const MainContent = () => (
    <div className="h-full w-full bg-white p-2">
        <Routes>
            <Route path="config" element={<Config />} />
        </Routes>
    </div>
);
export default MainContent;
