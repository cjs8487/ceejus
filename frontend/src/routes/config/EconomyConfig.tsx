import { faAdd, faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, Transition } from '@headlessui/react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Fragment, useEffect, useState } from 'react';
import * as yup from 'yup';
import { EconomyConfiguration, EconomyReward } from '../../types';
import { useGetApi } from '../../controller/Hooks';
import { useNavigate } from 'react-router-dom';
import { useFloating, useHover, useInteractions } from '@floating-ui/react';
import Toggle from 'react-toggle';

type EconomyRewardProps = {
    title: string;
    amount: number;
    cost: number;
    onClick: () => void;
};

const EconomyRewardCard = ({
    title,
    amount,
    cost,
    onClick,
}: EconomyRewardProps) => (
    <div
        className="flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-lg border border-gray-200 p-4 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
        onClick={onClick}
    >
        <div className="text-xl font-semibold">{title}</div>
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

interface RewardForm {
    title: string;
    amount: number;
    cost: number;
}

const configFormSchema = yup.object({
    currencyName: yup.string().required('Currency name is required'),
    passiveRate: yup
        .number()
        .min(0, 'Passive earn Rate must be a positive number')
        .max(10, 'Passive earn rate cannot be larger than 10')
        .required('Earn rate is required'),
    minimumGamble: yup
        .number()
        .required('A minimum gamble amount is required')
        .min(10, 'The minimum gamble amount must be at least 10')
        .max(1000, 'The minimum gamble amount cannot exceed 1000')
        .test(
            'is-mult-10',
            'The minimum gamble amount must be a multiple of 10',
            (val) => val % 10 === 0,
        ),
    requireActive: yup.bool().required(''),
});

const rewardFormValidationScheme = yup.object({
    title: yup.string().required('Reward title is required'),
    cost: yup
        .number()
        .min(1, 'Reward cost must be positive and greater than 0')
        .required('Reward cost is required'),
    amount: yup
        .number()
        .min(1, 'Reward amount must be positive and greater than 0')
        .required('Reward amount is required'),
});

const EconomyConfig = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(-1);
    const [formError, setFormError] = useState('');
    const [rateHelp, setRateHelp] = useState(false);

    const { refs, floatingStyles, context } = useFloating({
        open: rateHelp,
        onOpenChange: setRateHelp,
    });
    const hover = useHover(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

    const {
        data: rewards,
        error: rewardsError,
        isLoading: rewardsLoading,
        mutate: mutateRewards,
    } = useGetApi<EconomyReward[]>('/api/economy/rewards');

    const {
        data: config,
        error: configError,
        isLoading: configLoading,
        mutate: mutateConfig,
    } = useGetApi<EconomyConfiguration>('/api/economy/config');

    const navigate = useNavigate();

    useEffect(() => {
        if (rewardsError || configError) {
            navigate('/error?code=500');
        }
    }, [rewardsError, configError, navigate]);

    if (rewardsError || configError) {
        return null;
    }

    if ((!rewards && !rewardsLoading) || (!config && !configLoading)) {
        return (
            <div className="px-10 text-center">Unable to load reward data</div>
        );
    }

    if (!rewards || rewardsLoading || !config || configLoading) {
        return null;
    }

    const closeDialog = () => {
        setDialogOpen(false);
        setEditIndex(-1);
        setFormError('');
        mutateRewards();
    };

    const addClickHandler = () => {
        setDialogOpen(true);
    };

    const itemClickHandler = (index: number) => {
        setEditIndex(index);
        setDialogOpen(true);
    };

    const deleteActiveRedemption = async () => {
        if (editIndex === -1) {
            return;
        }
        await fetch(`/api/economy/rewards/${rewards[editIndex].id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        closeDialog();
    };

    return (
        <div>
            <div className="pb-3 text-center text-3xl">Economy</div>
            <div className="flex flex-col gap-12 px-10 text-center">
                <div className="rounded-lg border border-gray-200 p-4 shadow-lg">
                    <div className="pb-2 text-xl">Core Configuration</div>
                    <Formik
                        initialValues={config}
                        validationSchema={configFormSchema}
                        onSubmit={async (values: EconomyConfiguration) => {
                            console.log(values);
                            const res = await fetch('/api/economy/config', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(values),
                            });
                            if (!res.ok) {
                                navigate(`/error?code=${res.status}`);
                            }
                            mutateConfig();
                        }}
                    >
                        {({ isValidating, isSubmitting }) => (
                            <Form>
                                <div className="flex gap-4 pb-4">
                                    <label className="block flex-grow text-left">
                                        <div>Currency Name</div>
                                        <Field
                                            id="currencyName"
                                            type="text"
                                            name="currencyName"
                                            placeholder="Currency Name"
                                            className="form-input w-full rounded-md border border-slate-400 px-4 py-3 placeholder-gray-400 shadow-lg"
                                        />
                                        <ErrorMessage
                                            name="currencyName"
                                            component="div"
                                            className="text-xs text-red-400"
                                        />
                                    </label>
                                    <label className="block flex-grow text-left">
                                        <div>
                                            Passive Earn Rate
                                            <FontAwesomeIcon
                                                icon={faInfo}
                                                className="ml-1 px-1 pb-0.5 text-sm"
                                                ref={refs.setReference}
                                                {...getReferenceProps()}
                                            />
                                            {rateHelp && (
                                                <div
                                                    ref={refs.setFloating}
                                                    style={floatingStyles}
                                                    {...getFloatingProps()}
                                                    className=" z-10 max-w-md rounded-lg border border-gray-300 bg-slate-100 p-2 text-sm shadow-md"
                                                >
                                                    Passive earn rate dictates
                                                    how much currency viewers
                                                    passively earn by watching
                                                    the stream. Every 5 minutes,
                                                    the bot will automatically
                                                    add 100*rate currency to the
                                                    balance of all viewers in
                                                    chat. You may optionally
                                                    require that viewers be
                                                    "active" in chat, requiring
                                                    that they have sent at least
                                                    one message since the last
                                                    deposit. Commands do not
                                                    count towards the activity
                                                    requirement
                                                </div>
                                            )}
                                        </div>
                                        <Field
                                            type="number"
                                            min="0"
                                            max="10"
                                            name="passiveRate"
                                            placeholder="Earn Rate"
                                            className="form-input w-full rounded-md border border-slate-400 px-4 py-3 placeholder-gray-400 shadow-lg"
                                        />
                                        <ErrorMessage
                                            name="passiveRate"
                                            component="div"
                                            className="text-xs text-red-400"
                                        />
                                        <div className="flex items-center gap-2 pt-2 text-sm">
                                            <Field
                                                as={Toggle}
                                                name="requireActive"
                                            />
                                            Require Activity
                                        </div>
                                    </label>
                                    <label className="block flex-grow text-left">
                                        <div>Minimum Gamble Amount</div>
                                        <Field
                                            type="number"
                                            step="10"
                                            min="0"
                                            max="1000"
                                            name="minimumGamble"
                                            placeholder="Minimum Gamble"
                                            className="form-input w-full rounded-md border border-slate-400 px-4 py-3 placeholder-gray-400 shadow-lg"
                                        />
                                        <ErrorMessage
                                            name="minimumGamble"
                                            component="div"
                                            className="text-xs text-red-400"
                                        />
                                    </label>
                                </div>
                                <div className="flex">
                                    <div className="flex-grow" />
                                    <button
                                        className="inline-flex justify-center rounded-md border border-transparent bg-green-300 px-4 py-2 text-sm font-medium text-black hover:bg-green-400 disabled:bg-gray-300"
                                        type="submit"
                                        disabled={isSubmitting || isValidating}
                                    >
                                        Save
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 shadow-lg">
                    <div className="text-xl">Rewards</div>
                    <div className="pb-4 text-sm">
                        Viewers can redeem channel points for currency using the
                        rewards you configure
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-16 gap-y-10">
                        {rewards.map((redemption, index) => (
                            <EconomyRewardCard
                                title={redemption.title}
                                amount={redemption.amount}
                                cost={redemption.cost}
                                onClick={() => itemClickHandler(index)}
                                key={redemption.id}
                            />
                        ))}
                        {rewards.length === 0 && (
                            <div className="text-lg font-semibold">
                                No economy rewards defined.
                            </div>
                        )}
                    </div>
                </div>
                <FontAwesomeIcon
                    icon={faAdd}
                    size="3x"
                    role="button"
                    className="fixed bottom-14 right-2 rounded-full border-slate-700 bg-gray-500 bg-opacity-70 px-2 py-1 shadow-xl transition-all duration-200 hover:scale-110 hover:bg-opacity-100"
                    onClick={addClickHandler}
                />
            </div>
            <Transition show={dialogOpen} as={Fragment}>
                <Dialog
                    open={dialogOpen}
                    onClose={closeDialog}
                    as="div"
                    className="relative"
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50"
                            aria-hidden="true"
                        />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="mb-4 text-center text-lg font-medium leading-6 text-gray-900"
                                    >
                                        {editIndex !== -1
                                            ? 'Edit Economy Reward'
                                            : 'Create New Economy Reward'}
                                    </Dialog.Title>
                                    <Formik
                                        initialValues={{
                                            title:
                                                editIndex !== -1
                                                    ? rewards[editIndex].title
                                                    : '',
                                            amount:
                                                editIndex !== -1
                                                    ? rewards[editIndex].amount
                                                    : 0,
                                            cost:
                                                editIndex !== -1
                                                    ? rewards[editIndex].cost
                                                    : 0,
                                        }}
                                        validationSchema={
                                            rewardFormValidationScheme
                                        }
                                        onSubmit={async (
                                            values: RewardForm,
                                        ) => {
                                            setFormError('');
                                            const res = await fetch(
                                                editIndex === -1
                                                    ? '/api/economy/rewards/create'
                                                    : `/api/economy/rewards/${rewards[editIndex].id}`,
                                                {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type':
                                                            'application/json',
                                                    },
                                                    body: JSON.stringify(
                                                        values,
                                                    ),
                                                },
                                            );
                                            if (!res.ok) {
                                                setFormError(await res.text());
                                                return;
                                            }
                                            closeDialog();
                                        }}
                                    >
                                        {({ isValidating, isSubmitting }) => (
                                            <Form>
                                                <div>
                                                    {formError && (
                                                        <div className="pb-1 text-sm text-red-400">
                                                            {formError}
                                                        </div>
                                                    )}
                                                    <Field
                                                        type="text"
                                                        name="title"
                                                        placeholder="Reward Title"
                                                        className="form-input w-full rounded-md border border-slate-400 px-4 py-3 placeholder-gray-400 shadow-lg"
                                                    />
                                                    <ErrorMessage
                                                        name="title"
                                                        component="div"
                                                        className="text-xs text-red-400"
                                                    />

                                                    <Field
                                                        type="number"
                                                        name="cost"
                                                        placeholder="Point Cost"
                                                        className="form-input mt-3 w-full rounded-md border border-slate-400 px-4 py-3 placeholder-gray-400 shadow-lg"
                                                    />
                                                    <ErrorMessage
                                                        name="cost"
                                                        component="div"
                                                        className="text-xs text-red-400"
                                                    />

                                                    <Field
                                                        type="number"
                                                        name="amount"
                                                        placeholder="Amount"
                                                        className="form-input mt-3 w-full rounded-md border border-slate-400 px-4 py-3 placeholder-gray-400 shadow-lg"
                                                    />
                                                    <ErrorMessage
                                                        name="amount"
                                                        component="div"
                                                        className="text-xs text-red-400"
                                                    />
                                                </div>
                                                <div className="mt-4 flex">
                                                    <button
                                                        type="button"
                                                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-red-400"
                                                        onClick={closeDialog}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <div className="grow" />
                                                    {editIndex !== -1 && (
                                                        <button
                                                            type="button"
                                                            className="mr-1 inline-flex justify-center rounded-md border border-transparent bg-red-300 px-4 py-2 text-sm font-medium text-black hover:bg-red-400"
                                                            onClick={
                                                                deleteActiveRedemption
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                    <button
                                                        className="inline-flex justify-center rounded-md border border-transparent bg-green-300 px-4 py-2 text-sm font-medium text-black hover:bg-green-400 disabled:bg-gray-300"
                                                        type="submit"
                                                        disabled={
                                                            isSubmitting ||
                                                            isValidating
                                                        }
                                                    >
                                                        Submit
                                                    </button>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default EconomyConfig;
