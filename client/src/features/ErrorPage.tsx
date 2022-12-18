import { Card, Code, NonIdealState } from "@blueprintjs/core";
import { css, StyleSheet } from "aphrodite";
import { useEnvironmentContext } from "providers/EnvironmentProvider";
import { useMemo } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { DefaultProps } from "utils/styles";

type ErrorPageProps = DefaultProps;

const ErrorPage: React.FC<ErrorPageProps> = () => {
  const styles = useStyleSheet();
  const { environment } = useEnvironmentContext();
  const error = useRouteError();

  const renderContent = () => {
    if (environment === "production") {
      return (
        <NonIdealState
          icon="error"
          title="Something went wrong!"
          description="Sorry about that. Try reloading the page or coming back later."
        />
      );
    }

    if (isRouteErrorResponse(error)) {
      return (
        <NonIdealState
          icon="error"
          title={error.status}
          description={error.statusText}
        >
          {error.data?.message !== undefined && (
            <Code>{error.data.message}</Code>
          )}
        </NonIdealState>
      );
    }

    if (error instanceof Error) {
      return (
        <NonIdealState
          icon="error"
          title={error.name}
          description={<Code>{error.message}</Code>}
          className={css(styles.nonIdealState)}
        >
          {error.stack !== undefined && (
            <Card className={css(styles.card)}>
              <Code className={css(styles.code)}>
                <pre>{String(error.stack)}</pre>
              </Code>
            </Card>
          )}
        </NonIdealState>
      );
    }
  };

  return <div className={css(styles.root)}>{renderContent()}</div>;
};

const useStyleSheet = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        },
        nonIdealState: {
          width: "unset",
        },
        card: {
          maxWidth: "unset",
          width: "fit-content",
          display: "flex",
          alignItems: "flex-start",
        },
        code: {
          padding: "none",
          border: "none",
          outline: "none",
          textAlign: "left",
          width: "fit-content",
          boxShadow: "none",
        },
      }),
    []
  );
};

export default ErrorPage;
