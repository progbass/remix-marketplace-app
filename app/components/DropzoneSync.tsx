// Dropzone.tsx
import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone-esm";
import { PhotoIcon } from "@heroicons/react/24/solid";

interface DropezoneSyncProps {
  onFilesAdded?: (files: any) => void;
  name?: string;
}

export default function DropzoneSync({
  onFilesAdded,
  name,
}: DropezoneSyncProps) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const onDrop = (event) => {
    
    console.log(event)
    // Manually trigger input change event to update the input value
    const input = inputRef.current;
    input.files = event.dataTransfer.files; // Set the new files
    // const changeEvent = new Event("change", { bubbles: true });
    // input.dispatchEvent(changeEvent);
  };

  //
    // accept: {
    //   "image/png": [".png"],
    //   "text/html": [".html", ".htm"],
    //   "application/pdf": [".pdf"],
    //   "application/msword": [".doc"],
    //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    //     [".docx"],
    //   "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
    // },


  const thumbs = files.map((file) => (
    <div key={file.name}>
      <div>
        <img
          src={file.preview}
          // Revoke data uri after image is loaded
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
    </div>
  ));



  // Render the dropzone
  return (
    <div>
      <input 
        name={name || undefined} 
        id={name || undefined} 
        ref={inputRef} 
        type="file"
        hidden
    />

      <div 
        onDrop={onDrop} 
        onClick={() => inputRef ? inputRef?.current.click() : null}
        className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
        >
        <div className="text-center">
          <PhotoIcon
            className="mx-auto h-12 w-12 text-gray-300"
            aria-hidden="true"
          />
          <p className="mt-1 text-sm leading-6 text-gray-600">
            {'isDragActive'
              ? "Drop the files here..."
              : "Drag 'n' drop some files here, or click to select files"}
          </p>
        </div>
      </div>
      {'acceptedFileItems.length' && (
        <div className="text-center">
          <h4>Files</h4>
          {thumbs}
          <ul>{'acceptedFileItems'}</ul>
        </div>
      )}
    </div>
  );
}
