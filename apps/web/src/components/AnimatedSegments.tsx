import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import styles from "./AnimatedSegments.module.css";

export function AnimatedSegments({
  value,
  onChange,
  onReselect,
  items,
  className,
  "aria-label": label,
}: {
  value: string;
  onChange: (value: string) => void;
  onReselect?: (value: string) => void;
  items: readonly { value: string; label: ReactNode }[];
  className?: string;
  "aria-label": string;
}) {
  const id = useId(),
    reduced = useReducedMotion();
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      aria-label={label}
      className={`${styles.group} ${className ?? ""}`}
    >
      {items.map((item) => (
        <Radio.Root
          key={item.value}
          value={item.value}
          className={styles.item}
          onClick={() => {
            if (value === item.value) onReselect?.(item.value);
          }}
        >
          {value === item.value && (
            <motion.span
              className={styles.pill}
              layoutId={id}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 500, damping: 38 }
              }
            />
          )}
          <span className={styles.label}>{item.label}</span>
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
