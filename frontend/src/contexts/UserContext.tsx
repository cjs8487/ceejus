import { createContext, useMemo, useState } from 'react';
import { User } from '../ApiTypes';

interface UserContextInterface {
    loggedIn: boolean;
    user?: User;
}

export const initialUserContext: UserContextInterface = {
    loggedIn: false,
    user: undefined,
};

type UpdateType = React.Dispatch<React.SetStateAction<UserContextInterface>>;
const defaultUpdate: UpdateType = () => initialUserContext;

export const UserContext = createContext({
    state: initialUserContext,
    update: defaultUpdate,
});

export const UserContextProvider = (props: React.PropsWithChildren) => {
    const [state, update] = useState(initialUserContext);
    const value = useMemo(() => ({ state, update }), [state, update]);
    return (
        <UserContext.Provider value={value}>
            {props.children}
        </UserContext.Provider>
    );
};