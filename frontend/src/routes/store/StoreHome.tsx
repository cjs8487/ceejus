import { useNavigate } from 'react-router-dom';

interface StoreCardProps {
    owner: string;
    avatar: string;
    amount: number;
    currencyName: string;
}

const StoreCard = ({ owner, avatar, amount, currencyName }: StoreCardProps) => {
    const navigate = useNavigate();
    const toStore = () => {
        navigate(`${owner}`);
    };
    return (
        <div
            className="flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-lg border border-gray-200 p-4 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
            onClick={toStore}
        >
            <div className="text-2xl">{owner}</div>
            <img
                src={avatar}
                alt=""
                width="128px"
                className="rounded-full border shadow-sm"
            />
            <div className="inline-flex text-lg">
                {amount} {currencyName}
            </div>
        </div>
    );
};

const stores: StoreCardProps[] = [
    {
        owner: 'cjs0789',
        amount: 125414,
        currencyName: 'BiTcoins',
        avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/7c0be12f-b3aa-493a-a824-af6636bc6097-profile_image-300x300.png',
    },
    {
        owner: 'cjs0789',
        amount: 125414,
        currencyName: 'BiTcoins',
        avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/7c0be12f-b3aa-493a-a824-af6636bc6097-profile_image-300x300.png',
    },
    {
        owner: 'cjs0789',
        amount: 125414,
        currencyName: 'BiTcoins',
        avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/7c0be12f-b3aa-493a-a824-af6636bc6097-profile_image-300x300.png',
    },
    {
        owner: 'cjs0789',
        amount: 125414,
        currencyName: 'BiTcoins',
        avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/7c0be12f-b3aa-493a-a824-af6636bc6097-profile_image-300x300.png',
    },
    {
        owner: 'cjs0789',
        amount: 125414,
        currencyName: 'BiTcoins',
        avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/7c0be12f-b3aa-493a-a824-af6636bc6097-profile_image-300x300.png',
    },
    {
        owner: 'cjs0789',
        amount: 125414,
        currencyName: 'BiTcoins',
        avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/7c0be12f-b3aa-493a-a824-af6636bc6097-profile_image-300x300.png',
    },
    {
        owner: 'cjs0789',
        amount: 125414,
        currencyName: 'BiTcoins',
        avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/7c0be12f-b3aa-493a-a824-af6636bc6097-profile_image-300x300.png',
    },
    {
        owner: 'cjs0789',
        amount: 125414,
        currencyName: 'BiTcoins',
        avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/7c0be12f-b3aa-493a-a824-af6636bc6097-profile_image-300x300.png',
    },
];

const StoreHome = () => {
    return (
        <div className="mt-4 flex flex-col items-center justify-center gap-y-8">
            <div className="text-4xl">Your Stream Stores</div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-6">
                {stores.map((store) => (
                    <StoreCard
                        owner={store.owner}
                        avatar={store.avatar}
                        amount={store.amount}
                        currencyName={store.currencyName}
                    />
                ))}
            </div>
        </div>
    );
};

export default StoreHome;
