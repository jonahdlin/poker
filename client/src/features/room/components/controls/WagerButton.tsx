import { Button, H6, MultiSlider, NumericInput } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { css, StyleSheet } from "aphrodite";
import { isInteger } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { DefaultProps } from "utils/styles";

type WagerButtonProps = DefaultProps & {
  readonly disabled?: boolean;
  readonly callAmount: number;
  readonly wagerMinimum: number;
  readonly maximum: number;
  readonly onChange: (wager: number) => unknown;
  readonly wager: number;
  readonly onSubmit: () => unknown;
};

const WagerButton: React.FC<WagerButtonProps> = ({
  style,
  children,
  disabled = false,
  callAmount,
  wagerMinimum,
  maximum,
  onChange,
  wager,
  onSubmit,
}) => {
  const styles = useStyleSheet();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sliderInternalValue, setSliderInternalValue] = useState(
    wager + callAmount
  );
  const [numericInputInternalValue, setNumericInputInternalValue] = useState(
    `${wager + callAmount}`
  );

  useEffect(() => {
    setSliderInternalValue(wager + callAmount);
    setNumericInputInternalValue(`${wager + callAmount}`);
  }, [wager, callAmount]);

  const handleSubmitNumericInputValue = (valueAsString: string) => {
    const value = parseFloat(valueAsString);
    if (
      isInteger(value) &&
      value <= maximum &&
      value >= callAmount + wagerMinimum
    ) {
      onChange(value - callAmount);
    } else {
      setNumericInputInternalValue(`${wager + callAmount}`);
    }
  };

  return (
    <div className={css(styles.root, style)}>
      <Button
        outlined
        className={css(
          styles.actionButton,
          styles.leftButtonInGroup,
          disabled && styles.disabled
        )}
        onClick={disabled ? undefined : () => onSubmit()}
      >
        {children}
      </Button>
      <Popover2
        onClose={() => setPopoverOpen(false)}
        isOpen={popoverOpen}
        placement="top"
        content={
          <div className={css(styles.pickerContent)}>
            <H6 style={{ margin: 0 }}>Your bet</H6>
            <NumericInput
              stepSize={10}
              leftIcon="lifesaver"
              value={numericInputInternalValue}
              min={wagerMinimum + callAmount}
              max={maximum}
              onButtonClick={(_, valueAsString) => {
                handleSubmitNumericInputValue(valueAsString);
              }}
              onBlur={() => {
                handleSubmitNumericInputValue(numericInputInternalValue);
              }}
              onValueChange={(_, valueAsString) => {
                setNumericInputInternalValue(valueAsString);
              }}
            />
            <MultiSlider
              className={css(styles.slider)}
              min={0}
              stepSize={1}
              max={maximum}
              labelValues={[callAmount + wagerMinimum, maximum]}
              onChange={(values) => {
                if (values.length !== 2) {
                  return;
                }
                const value = values[1];
                if (value <= maximum && value >= callAmount + wagerMinimum) {
                  setSliderInternalValue(value);
                }
              }}
              onRelease={(values) => {
                if (values.length !== 2) {
                  return;
                }
                const value = values[1];
                if (value <= maximum && value >= callAmount + wagerMinimum) {
                  onChange(value - callAmount);
                }
              }}
            >
              <MultiSlider.Handle
                className={css(styles.callAmountHandle)}
                value={callAmount + wagerMinimum}
                type="full"
                intentBefore="success"
                intentAfter="primary"
                interactionKind="lock"
              />
              <MultiSlider.Handle
                value={sliderInternalValue}
                type="full"
                intentAfter="none"
              />
            </MultiSlider>
          </div>
        }
        disabled={disabled}
      >
        <Button
          outlined
          className={css(
            styles.moreButton,
            styles.rightButtonInGroup,
            disabled && styles.disabled
          )}
          onClick={disabled ? undefined : () => setPopoverOpen(!popoverOpen)}
          icon="plus"
        />
      </Popover2>
    </div>
  );
};

const useStyleSheet = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          display: "flex",
          alignItems: "stretch",
        },
        actionButton: {
          height: 100,
          padding: 38,
          minWidth: 120,
        },
        disabled: {
          opacity: 0.65,
          cursor: "default",
          pointerEvents: "none",
        },
        leftButtonInGroup: {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
        rightButtonInGroup: {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderLeft: 0,
        },
        moreButton: {
          height: 100,
          padding: 8,
        },
        pickerContent: {
          display: "flex",
          flexDirection: "column",
          padding: 24,
          gap: 12,
        },
        slider: {
          minWidth: 300,
          width: 500,
        },
        callAmountHandle: {
          display: "none",
        },
      }),
    []
  );
};

export default WagerButton;
