// Dropzone.tsx
import {
    ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

interface InputTextProps {
    id?: string;
    name: string;
    label?: string;
    placeholder?: string;
    defaultValue?: string|number;
    required?: boolean;
    helperText?: string;
    disabled?: boolean;
    className?: string;
    autoComplete?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    value?: string;
    errors?: Array<string>;
    type?: string;
    accept?: string;
    multiple?: boolean;
    icon?: string;
    iconPosition?: string;
    iconColor?: string;
    iconSize?: string;
}


//
function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
 
export default function InputText(props:InputTextProps) {
    const { label, errors, helperText, ...inputProps } = props;
  
    // Render the dropzone
    return (
    <div className="relative">
        <label
            htmlFor={inputProps?.id || undefined}
            className="block text-sm font-medium leading-6 text-gray-700"
        >{label}</label>
        
        <div className="relative mt-1">
            <input
                {...inputProps}
                className={classNames(
                    "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
                    errors ? "pr-10 text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500 shadow-none" : "",
                    inputProps.className && inputProps.className
                )}
                aria-invalid={errors ? "true" : "false"}
            />
            {errors && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
            )}
        </div>
        {errors && (
            <p className="mt-2 text-sm text-red-600" id={label ? `${label}-error` : undefined}>
               {errors}
            </p>
        )}
        {helperText && (
            <p className="mt-3 text-sm leading-6 text-gray-600">
                {helperText}
            </p>
        )}
    </div>
    )
  }