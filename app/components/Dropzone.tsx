// Dropzone.tsx
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone-esm";
import { PhotoIcon } from "@heroicons/react/24/solid";

interface DropezoneProps {
  onFilesAdded?: (files: any) => void;
  name?: string;
}

export default function Dropzone({ onFilesAdded, name }: DropezoneProps) {
  const [files, setFiles] = useState([]);
  const onDrop = useCallback((acceptedFiles) => {
    // silently ignore if nothing to do
    if (acceptedFiles.length < 1) {
      return;
    }

    // Do something with the files
    onFilesAdded && onFilesAdded(acceptedFiles);
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  }, []);

  //
  const {
    acceptedFiles,
    fileRejections,

    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    // accept: {
    //   "image/png": [".png"],
    //   "text/html": [".html", ".htm"],
    //   "application/pdf": [".pdf"],
    //   "application/msword": [".doc"],
    //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    //     [".docx"],
    //   "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
    // },
    // maxFiles: 1,
  });

  const acceptedFileItems = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

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

  const fileRejectionItems = fileRejections.map(({ file, errors }) => {
    return (
      <li key={file.path}>
        {file.path} - {file.size} bytes
        <ul>
          {errors.map((e) => (
            <li key={e.code}>{e.message}</li>
          ))}
        </ul>
      </li>
    );
  });

  // Render the dropzone
  return (
    <div {...getRootProps()}>
      <input
        {...getInputProps({
          name: name || undefined,
          id: name || undefined,
        })}
      />

      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
        <div className="text-center">
          <PhotoIcon
            className="mx-auto h-12 w-12 text-gray-300"
            aria-hidden="true"
          />
          <p className="mt-1 text-sm leading-6 text-gray-600">
            {isDragActive
              ? "Drop the files here..."
              : "Drag 'n' drop some files here, or click to select files"}
          </p>
        </div>
      </div>
      {acceptedFileItems.length > 0 && (
        <div className="text-center">
          <h4>Files</h4>
          {thumbs}
          <ul>{acceptedFileItems}</ul>
        </div>
      )}
    </div>
  );
}
