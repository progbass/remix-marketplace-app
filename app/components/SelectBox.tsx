import { v4 as uuidv4 } from "uuid";
import { Fragment, useState, useEffect, memo } from "react";
import { Listbox, Transition, Switch } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import {
  XMarkIcon,
  ChevronUpDownIcon,
  CheckIcon,
} from "@heroicons/react/20/solid";

interface Option {
  id: string | number | null | undefined;
  name: string;
}
interface SelectBoxProps {
  label: string;
  value?: Option | null;
  optionsList: Option[];
  onChange?: (selectedOption: Option) => void;
  name?: string | null;
  helperText?: string;
  disabled?: boolean;
  excludeDefaultOption?: boolean;
}

//
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const DEFAULT_OPTION: Option = {
  name: "Elige una opción",
  id: undefined,
};

//
export default memo(function SelectBox({
  label,
  value = null,
  optionsList,
  name = null,
  onChange,
  helperText,
  disabled = false,
  excludeDefaultOption = false,
}: SelectBoxProps) {
  const uniqueId = name || uuidv4();

  // Add default option to the list
  let finalOptionsList = optionsList;
  if (!excludeDefaultOption) {
    finalOptionsList = [DEFAULT_OPTION, ...finalOptionsList];
  }

  // Selected value state
  const [selectedOption, setSelectedOption] = useState<Option>(
    value ?? finalOptionsList[0]
  );
  useEffect(() => {
    // When the parent sets value to null, reset the internal state
    if (value === null) {
      setSelectedOption(finalOptionsList[0]);
      return;
    }
    setSelectedOption(value);
  }, [value]);

  // Handle change
  const onValueChange = (option: { name: string; id: string | number }) => {
    if (onChange) {
      onChange(option);
    }
    setSelectedOption(option);
  };

  // Return JSX
  return (
    <>
      <Listbox
        disabled={disabled}
        value={selectedOption}
        onChange={onValueChange}
      >
        {({ open }) => (
          <>
            {
              // Render the label if provided
              label && (
                <Listbox.Label
                  htmlFor={name ? `listbox-${uniqueId}` : undefined}
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  {label}
                </Listbox.Label>
              )
            }

            <div className="relative mt-2">
              <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary-600 sm:text-sm sm:leading-6">
                <span className="block truncate">{selectedOption.name}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {finalOptionsList.map(
                    (option: { id: string | number | null; name: string }) => (
                      <Listbox.Option
                        key={option.id}
                        className={({ active }) =>
                          classNames(
                            active ? "bg-gray-300 text-white" : "text-gray-900",
                            "relative cursor-default select-none py-2 pl-3 pr-9"
                          )
                        }
                        value={option}
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={classNames(
                                selected ? "font-semibold" : "font-normal",
                                "block truncate"
                              )}
                            >
                              {option.name}
                            </span>

                            {selected ? (
                              <span
                                className={classNames(
                                  active ? "text-white" : "text-secondary-600",
                                  "absolute inset-y-0 right-0 flex items-center pr-4"
                                )}
                              >
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    )
                  )}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>

      {helperText && (
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Write a few sentences about your product.
        </p>
      )}
    </>
  );
});
