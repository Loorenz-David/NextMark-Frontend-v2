import { useEffect, useMemo, useState } from "react";

type FailureNoteComposerProps = {
  value: string;
  onValueChange: (value: string) => void;
  predefinedOptions?: string[];
  customOptionLabel?: string;
};

const DEFAULT_PREDEFINED_OPTIONS = [
  "Customer unavailable at delivery location.",
  "Incorrect or incomplete delivery address.",
  "Delivery window missed due to restricted access.",
  "Order damaged during transportation.",
  "Recipient refused delivery.",
  "Vehicle breakdown delayed delivery.",
];

const CheckMarkIcon = ({ className }: { className?: string }) => (
  <svg fill="none" viewBox="0 0 24 24" className={className}>
    <path
      d="M5 12.5 9.5 17 19 7.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.25"
    />
  </svg>
);

const selectedIconStyle = {
  backgroundColor: "rgba(96, 165, 250, 0.92)",
};

const selectedCustomIconStyle = {
  borderColor: "rgba(147, 197, 253, 0.9)",
  backgroundColor: "rgba(96, 165, 250, 0.92)",
};

const unselectedIconStyle = {
  borderColor: "rgba(147, 197, 253, 0.72)",
  backgroundColor: "rgba(239, 246, 255, 0.96)",
};

const selectedOptionStyle = {
  borderColor: "rgba(96, 165, 250, 0.42)",
  backgroundColor: "rgba(96, 165, 250, 0.12)",
  color: "rgba(239, 246, 255, 0.98)",
};

const selectedCustomContainerStyle = {
  borderColor: "rgba(96, 165, 250, 0.42)",
  backgroundColor: "rgba(96, 165, 250, 0.12)",
};

const focusedInputStyle = {
  borderColor: "rgba(96, 165, 250, 0.42)",
};

export const FailureNoteComposer = ({
  value,
  onValueChange,
  predefinedOptions,
  customOptionLabel = "Custom message",
}: FailureNoteComposerProps) => {
  const options = useMemo(
    () => predefinedOptions ?? DEFAULT_PREDEFINED_OPTIONS,
    [predefinedOptions],
  );

  const [selectedOption, setSelectedOption] = useState<string>("custom");

  useEffect(() => {
    const matchedOption = options.find((option) => option === value);
    setSelectedOption(matchedOption ?? "custom");
  }, [options, value]);

  return (
    <div className="flex flex-col px-4 space-y-3 py-4 ">
      {options.map((option) => {
        const isSelected = selectedOption === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => {
              setSelectedOption(option);
              onValueChange(option);
            }}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
              isSelected
                ? ""
                : "border-white/10 bg-[var(--color-page)] text-white/80 hover:border-white/25"
            }`}
            style={isSelected ? selectedOptionStyle : undefined}
          >
            {isSelected ? (
              <div
                className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                style={selectedIconStyle}
              >
                <CheckMarkIcon className="h-3 w-3 text-white" />
              </div>
            ) : (
              <span
                className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                style={unselectedIconStyle}
              >
                {" "}
              </span>
            )}

            <span className="leading-6">{option}</span>
          </button>
        );
      })}

      <div
        className={`block rounded-lg border px-3 py-2 ${
          selectedOption === "custom"
            ? ""
            : "border-white/10 bg-[var(--color-page)]"
        }`}
        style={selectedOption === "custom" ? selectedCustomContainerStyle : undefined}
      >
        <button
          type="button"
          onClick={() => setSelectedOption("custom")}
          className="mb-2 flex w-full items-center gap-3 text-left text-sm text-white/80"
        >
          {selectedOption === "custom" ? (
            <div
              className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
              style={selectedCustomIconStyle}
            >
              <CheckMarkIcon className="h-3 w-3 text-white" />
            </div>
          ) : (
            <span
              className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
              style={unselectedIconStyle}
            >
              {" "}
            </span>
          )}
          <span>{customOptionLabel}</span>
        </button>
        <input
          type="text"
          value={selectedOption === "custom" ? value : ""}
          onFocus={() => setSelectedOption("custom")}
          onChange={(event) => {
            setSelectedOption("custom");
            onValueChange(event.target.value);
          }}
          className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/35"
          style={selectedOption === "custom" ? focusedInputStyle : undefined}
          placeholder="Type custom failure reason..."
        />
      </div>
    </div>
  );
};
