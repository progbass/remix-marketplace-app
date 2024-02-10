import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';
import { FaceSmileIcon } from '@heroicons/react/24/solid';

// TYPES
interface DialogOverlayProps {
    isOpen: boolean;
    onClose?: Function|null;
    onSubmit?: Function|null;
    children?: React.ReactNode;
    labelActionButton?: string;
    labelCancelButton?: string;
}

export default function DialogOverlay ({ 
  onClose, 
  onSubmit,
  children = '' ,
  labelActionButton = 'Aceptar',
  labelCancelButton = 'Cancelar',
}: DialogOverlayProps) {
  const [open, setOpen] = useState(true)
  const WIDTH_MODE = {
    DEFAULT: 'max-w-lg',
    XL: 'max-w-xl',
    XXL: 'max-w-2xl',
    XXXL: 'max-w-3xl',
  }

  const onSubmitDialog = async () => {
    const formData = { name: 'DialogOverlay', state: false };
    // formData.append('name', 'DialogOverlay');

    // If onSubmit is a function, call it
    let rejectProcess = false;
    if (typeof onSubmit === 'function') {
      await onSubmit(formData)
        .catch((e) => {
          console.log('Error: ', e);
          rejectProcess = true;
        });
    }

    // If no errors, close dialog
    if(!rejectProcess){
      closeDialog();
    }
  }
  const closeDialog = () => {
    if(onClose) onClose();
    setOpen(false);
  }

  const cancelButtonRef = useRef(null)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" initialFocus={cancelButtonRef} onClose={closeDialog}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel 
                className={`sm:w-full sm:max-w-xl sm:my-8 sm:p-6 relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all`}
              >
                {/* Render dynamic child components */}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}