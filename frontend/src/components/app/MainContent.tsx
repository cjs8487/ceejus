import { Route, Routes } from 'react-router-dom';
import Config from '../../routes/config/Config';
import EconomyConfig from '../../routes/config/EconomyConfig';

const MainContent = () => (
    <div className="h-full w-full bg-white p-2">
        <Routes>
            <Route path="config">
                <Route index element={<Config />} />
                <Route path="economy" element={<EconomyConfig />} />
            </Route>
        </Routes>
    </div>
);
export default MainContent;
