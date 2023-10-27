import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, Transition } from '@headlessui/react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Fragment, useEffect, useState } from 'react';
import * as yup from 'yup';
import { EconomyReward } from '../../types';
import { useGetApi } from '../../controller/Hooks';
import { useNavigate } from 'react-router-dom';

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
    const {
        data: rewards,
        error,
        isLoading,
    } = useGetApi<EconomyReward[]>('/api/rewards');
    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            navigate('/error?code=500');
        }
    }, [error, navigate]);

    if (!rewards && !isLoading) {
        return (
            <div className="px-10 text-center">Unable to load reward data</div>
        );
    }

    if (!rewards || isLoading) {
        return <></>;
    }

    const closeDialog = () => {
        setDialogOpen(false);
        setEditIndex(-1);
        setFormError('');
    };
    const addClickHandler = () => {
        setDialogOpen(true);
    };
    const itemClickHandler = (index: number) => {
        setEditIndex(index);
        setDialogOpen(true);
    };

    return (
        <div>
            <div className="px-10 text-center">
                <div className="pb-3 text-3xl">Economy</div>
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
                        />
                    ))}
                </div>
                <FontAwesomeIcon
                    icon={faAdd}
                    size="3x"
                    role="button"
                    className="absolute bottom-14 right-2 rounded-full border-slate-700 bg-gray-500 bg-opacity-70 px-2 py-1 shadow-xl transition-all duration-200 hover:scale-110 hover:bg-opacity-100"
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
                                                '/api/rewards/create',
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
