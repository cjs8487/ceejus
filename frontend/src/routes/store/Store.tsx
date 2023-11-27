import { useParams } from 'react-router-dom';

const Store = () => {
    const { user } = useParams();

    return <>{user} owns this store</>;
};

export default Store;
