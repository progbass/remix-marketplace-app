import { XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid'

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Error({ errors = [], ...props }) {
    return (
        <>
            {errors.length > 0 && (
                <div
                    className={classNames(
                        props.className,
                        "border-l-4 border-red-400 bg-red-100 p-4"
                    )}
                >
                    <div className="flex">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">
                        {errors.map(error => (
                            <li key={error}>{error}</li>
                        ))}
                        </p>
                    </div>
                    </div>
                </div>
            )}
        </>
    )
}