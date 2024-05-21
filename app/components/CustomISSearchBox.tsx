import React, { useState, useRef } from 'react';
import { useInstantSearch, useSearchBox } from 'react-instantsearch';
import {
    MagnifyingGlassIcon,
  } from "@heroicons/react/24/outline";
  import { ChevronDownIcon } from "@heroicons/react/20/solid";



export default function CustomISSearchBox(props) {
  const { query, refine } = useSearchBox(props);
  const { status } = useInstantSearch();
  const [inputValue, setInputValue] = useState(query);
  const inputRef = useRef(null);

  const isSearchStalled = status === 'stalled';

  function setQuery(newQuery) {
    setInputValue(newQuery);

    refine(newQuery);
  }

  return (
    <div className="w-full max-w-lg lg:max-w-xs h-full flex items-center justify-center">
      <form
        className='w-full'
        action=""
        role="search"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();

          if (inputRef.current) {
            inputRef.current.blur();
          }
        }}
        onReset={(event) => {
          event.preventDefault();
          event.stopPropagation();

          setQuery('');

          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
        
      >
        <label htmlFor="search" className="sr-only">
            Búsqueda
        </label>
        <div className="relative text-gray-400 focus-within:text-gray-600">
            <input
                ref={inputRef}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Busca productos"
                spellCheck={false}
                maxLength={512}
                type="search"
                value={inputValue}
                onChange={(event) => {
                    setQuery(event.currentTarget.value);
                }}
                autoFocus
                className="block w-full rounded-md border-0 ring-2 ring-gray-200 border-gray-200 bg-white py-1.5 pr-10 pl-3 text-gray-900 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:text-sm sm:leading-6"
            />


            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <button type="submit" className='text-gray-400 hover:text-gray-500'>
                    <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* <button
                    type="reset"
                    hidden={inputValue.length === 0 || isSearchStalled}
                >
                    Reset
                </button> */}
            </div>
        </div>
        
        {/* <span hidden={!isSearchStalled}>Buscando...</span> */}
      </form>
    </div>
  );
}