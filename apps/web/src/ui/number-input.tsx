import { useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { TextInput, type TextInputProps } from "./input";
import { classes } from "./shared";
import styles from "./number-input.module.css";

type NumberInputProps = Omit<
  TextInputProps,
  "onChange" | "value" | "defaultValue" | "type" | "ref"
> & {
  value?: string | number;
  defaultValue?: number;
  onChange?: (value: string | number) => void;
  suffix?: string;
  hideControls?: boolean;
  decimalScale?: number;
};

/** Keep native number editing and its min/max/step semantics, with themed step buttons. */
export function NumberInput({
  onChange,
  suffix,
  hideControls,
  decimalScale: _decimalScale,
  className,
  rightSection,
  ...props
}: NumberInputProps) {
  const input = useRef<HTMLInputElement>(null);
  const name =
    props["aria-label"] ??
    (typeof props.label === "string" ? props.label : "value");
  const showStepper = !hideControls && props.step !== "any" && !props.readOnly;
  function step(direction: number) {
    const node = input.current;
    if (!node) return;
    const before = node.value;
    node.stepUp(direction);
    if (node.value !== before) onChange?.(node.valueAsNumber);
  }
  return (
    <TextInput
      {...props}
      ref={input}
      type="number"
      inputMode="decimal"
      className={classes(styles.number, className)}
      rightSection={
        showStepper || suffix || rightSection ? (
          <span className={styles.trailing}>
            {suffix ? (
              <span className={styles.suffix}>{suffix}</span>
            ) : (
              rightSection
            )}
            {showStepper && (
              <span className={styles.stepper}>
                {([1, -1] as const).map((direction) => {
                  const Icon = direction > 0 ? ChevronUp : ChevronDown;
                  return (
                    <Button
                      key={direction}
                      variant="ghost"
                      size="icon-xs"
                      tabIndex={-1}
                      aria-label={`${direction > 0 ? "Increase" : "Decrease"} ${name}`}
                      disabled={props.disabled}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => step(direction)}
                    >
                      <Icon aria-hidden />
                    </Button>
                  );
                })}
              </span>
            )}
          </span>
        ) : undefined
      }
      onChange={(event) =>
        onChange?.(
          event.currentTarget.value === ""
            ? ""
            : event.currentTarget.valueAsNumber,
        )
      }
    />
  );
}
