import { Link, useLocation, useNavigate } from 'react-router-dom';

type ErrorProps = {
    code?: number;
    message?: string;
};

const codeToSubText: Record<string, string> = {
    400: 'Bad Request',
    401: 'Not Logged In',
    403: 'No Permissions',
    404: 'Page Not Found',
    500: 'Server Error',
};

const codeToMessage: Record<string, string> = {
    400: "That request didn't work",
    401: 'You must be logged in to do that',
    403: "You don't have permission to do that",
    404: "The resource couldn't be found",
    500: 'The server encountered an error while processing the request',
};

const Error = ({ code, message }: ErrorProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);

    let dispCode;
    if (!code) {
        dispCode = params.get('code');
        if (!dispCode) {
            navigate('/error?code=400');
            return null;
        }
    } else {
        dispCode = code.toString();
    }

    let dispMessage;
    if (!message) {
        dispMessage = params.get('message');
        console.log(dispMessage);
        if (!dispMessage) {
            dispMessage = codeToMessage[dispCode];
        }
    } else {
        dispMessage = message;
    }

    return (
        <div className="flex h-full  w-full grow flex-col items-center justify-center gap-y-4 bg-slate-700 text-white">
            <div className="text-9xl">{dispCode}</div>
            <div className="text-lg">{codeToSubText[dispCode]}</div>
            <div className="text-sm">{dispMessage}</div>
            <Link className="underline" to="/">
                Return to home
            </Link>
        </div>
    );
};

export default Error;
