import {
  Button,
  FormGroup,
  Icon,
  InputGroup,
  NumericInput,
  Text,
} from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { css, StyleSheet } from "aphrodite";
import numeral from "numeral";
import { useMemo, useState } from "react";
import { DefaultProps } from "utils/styles";
import { Theme } from "utils/theme";

type ChooseSeatFormProps = DefaultProps & {
  readonly minNameLength: number;
  readonly maxNameLength: number;
  readonly minChipCount: number;
  readonly maxChipCount: number;

  readonly guestName: string;
  readonly currentName?: string;

  readonly onSubmit: (args: {
    readonly chipCount: number;
    readonly name?: string;
  }) => unknown;
};

const DEFAULT_CHIPS = 1000;

const ChooseSeatForm: React.FC<ChooseSeatFormProps> = ({
  style,
  minNameLength,
  maxNameLength,
  minChipCount,
  maxChipCount,

  guestName,
  currentName,

  onSubmit,
}) => {
  const styles = useStyleSheet();
  const [nameValue, setNameValue] = useState<string>(currentName ?? "");
  const [chipValue, setChipValue] = useState<number>(DEFAULT_CHIPS);

  const [showValidation, setShowValidation] = useState(false);

  const sanitizedName = useMemo(() => nameValue.trim(), [nameValue]);

  const nameValueValid = useMemo(() => {
    if (sanitizedName.length === 0) {
      return true;
    }

    if (
      sanitizedName.length > maxNameLength ||
      sanitizedName.length < minNameLength
    ) {
      return false;
    }

    return true;
  }, [sanitizedName, minNameLength, maxNameLength]);

  const chipValueValid = useMemo(() => {
    if (
      chipValue == null ||
      chipValue > maxChipCount ||
      chipValue < minChipCount
    ) {
      return false;
    }

    return true;
  }, [chipValue, maxChipCount, minChipCount]);

  const handleSubmit = () => {
    if (!chipValueValid || !nameValueValid || chipValue == null) {
      setShowValidation(true);
      return;
    }

    onSubmit({
      chipCount: chipValue,
      name: sanitizedName.length === 0 ? undefined : sanitizedName,
    });
  };

  return (
    <div className={css(styles.root, style)}>
      <FormGroup
        label={
          <div className={css(styles.nameLabelRow)}>
            <Text>Name</Text>
            <Tooltip2
              content="You can set your name later. But you can only set your name once!"
              placement="top"
              className={css(styles.infoTooltip)}
            >
              <Icon
                icon="info-sign"
                color={Theme.fontColorLight}
                size={14}
                tagName="div"
              />
            </Tooltip2>
          </div>
        }
        labelFor="name-input"
        disabled={currentName != null}
        intent={showValidation && !nameValueValid ? "danger" : undefined}
        helperText={
          showValidation && !nameValueValid
            ? `Must be between ${numeral(minNameLength).format(
                "0,0"
              )} and ${numeral(maxNameLength).format("0,0")} characters`
            : undefined
        }
      >
        <InputGroup
          id="name-input"
          value={nameValue}
          placeholder={currentName ?? guestName}
          onChange={({ target: { value } }) => setNameValue(value)}
        />
      </FormGroup>
      <FormGroup
        label="Chips"
        labelFor="chip-input"
        labelInfo="(required)"
        intent={showValidation && !chipValueValid ? "danger" : undefined}
        helperText={
          showValidation && !chipValueValid
            ? `Must be between ${numeral(minChipCount).format(
                "0,0"
              )} and ${numeral(maxChipCount).format("0,0")}`
            : undefined
        }
      >
        <NumericInput
          id="chip-input"
          leftIcon="bank-account"
          min={minChipCount}
          max={maxChipCount}
          stepSize={10}
          placeholder={numeral(DEFAULT_CHIPS).format("0,0")}
          onValueChange={(valueAsNumber) => setChipValue(valueAsNumber)}
        />
      </FormGroup>
      <div className={css(styles.footer)}>
        <Button intent="primary" onClick={() => handleSubmit()}>
          Sit down
        </Button>
      </div>
    </div>
  );
};

const useStyleSheet = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        },
        nameLabelRow: {
          display: "flex",
          alignItems: "center",
          gap: 4,
        },
        infoTooltip: {
          display: "flex",
          margin: 0,
        },
        footer: {
          display: "flex",
          alignItems: "flex-end",
        },
      }),
    []
  );
};

export default ChooseSeatForm;
