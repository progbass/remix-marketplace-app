// InputLabelList.tsx
import { useState } from 'react';

import classNames from '~/utils/classNames';

interface InputLabelListProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
  maxItems?: number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onListChange?: (keywordsList: Array<string>) => void;
  value?: string;
  errors?: Array<string>;
  type?: string;
  list: Array<string>;
  accept?: string;
  multiple?: boolean;
  icon?: string;
  iconPosition?: string;
  iconColor?: string;
  iconSize?: string;
}

export default function InputLabelList(props:InputLabelListProps) {
  const { label, list, maxItems, errors, helperText, ...inputProps } = props;
  const [keywords, setKeywords] = useState(typeof list ? list : []);
  const [currentKeyword, setCurrentKeyword] = useState('');

  const handleInputChange = (event) => {
    setCurrentKeyword(event.target.value);
  };

  const handleInputKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addKeyword();
    }
  };

  const addKeyword = () => {
    if(maxItems && keywords.length >= maxItems) {
      return;
    }

    if (currentKeyword.trim() !== '') {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword('');
    }

    //
    if(inputProps.onListChange){
      inputProps.onListChange([...keywords, currentKeyword.trim()]);
    }
  };

  const removeKeyword = (index) => {
    const newKeywords = [...keywords];
    newKeywords.splice(index, 1);
    setKeywords(newKeywords);

    //
    if(inputProps.onListChange){
      inputProps.onListChange(newKeywords);
    }
  };

  // Render the component
  return (
    <div className="relative">
      <label
        htmlFor={inputProps.id || undefined}
        className="block text-sm font-medium leading-6 text-gray-900"
      >{label}</label>

      <div className="mt-2">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input
            {...inputProps}
            className={classNames(
                "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
                errors ? "pr-10 text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500 shadow-none" : "",
                inputProps.className && inputProps.className
            )}
            value={currentKeyword}
            onChange={handleInputChange}
            onKeyPress={handleInputKeyPress}
            aria-invalid={errors ? "true" : "false"}
          />
        </div>

        <div>
          {keywords.map((keyword, index) => (
            <div 
              key={index}
              className="bg-indigo-100 inline-flex items-center text-sm rounded mt-2 mr-1"
            >
              <span
                className="ml-2 mr-1 leading-relaxed truncate max-w-xs"
                x-text="tag"
              >{keyword}</span>
              <button 
                type='button'
                onClick={() => removeKeyword(index)}
                className="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none"
              >
                <svg
                  className="w-6 h-6 fill-current mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
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
  );
}