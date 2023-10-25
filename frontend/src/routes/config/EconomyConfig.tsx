type EconomyRewardProps = {
    name: string;
    amount: number;
    cost: number;
};

const rewards: EconomyRewardProps[] = [
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
    { name: '500 BiTcoins', amount: 500, cost: 1000 },
];

const EconomyReward = ({ name, amount, cost }: EconomyRewardProps) => (
    <div className="flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-lg border border-gray-200 p-4 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg">
        <div className="text-xl font-semibold">{name}</div>
        <div className="rounded-lg bg-gray-200">
            <img
                src="https://static-cdn.jtvnw.net/custom-reward-images/default-4.png"
                alt="reward icon"
            />
        </div>
        <div>{amount} currency</div>
        <div>{cost} channel points</div>
    </div>
);

const EconomyConfig = () => (
    <div className="px-10 text-center">
        <div className="pb-3 text-3xl">Economy</div>
        <div className="text-xl">Rewards</div>
        <div className="pb-4 text-sm">
            Viewers can redeem channel points for currency using the rewards you
            configure
        </div>
        <div className="flex flex-wrap justify-center gap-x-16 gap-y-10">
            {rewards.map((redemption) => (
                <EconomyReward
                    name={redemption.name}
                    amount={redemption.amount}
                    cost={redemption.cost}
                />
            ))}
        </div>
    </div>
);

export default EconomyConfig;
