import { useParams } from 'react-router-dom';

const Store = () => {
    const { user } = useParams();

    return (
        <div>
            {user} owns this store
            <div className="flex">
                <div className="flex flex-col items-center justify-center gap-y-2 rounded-md border shadow-md">
                    <div className="h-24 w-full rounded-t-md bg-orange-600"></div>
                    <div className="px-4">Product name</div>
                    <div>product type</div>
                    <div>1000 BiTcoins</div>
                </div>
            </div>
        </div>
    );
};

export default Store;
