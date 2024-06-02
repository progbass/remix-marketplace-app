//
type SpinnerProps = {
  color?: string;
  backgroundColor?: string;
  size?: number;
};
export default function Spinner(props: SpinnerProps) {
  const {
    color = "border-secondary-600",
    backgroundColor = "border-gray-300",
    size = 8,
  } = props;
  const iconSize = {
    width: `w-${size}`,
    height: `h-${size}`,
  };

  // Render component
  return (
    <>
      <div className={`inline-block relative ${iconSize.width} ${iconSize.height}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-full h-full rounded-full border-4 border-solid ${backgroundColor}`}
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-full h-full rounded-full border-4 border-solid ${color} border-r-transparent align-[-0.125em] animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]`}
          />
        </div>
      </div>
    </>
  );
}
