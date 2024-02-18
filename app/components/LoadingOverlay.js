import { LoadingOverlay as MantineLoadingOverlay } from "@mantine/core";

export default function LoadingOverlay({ visible }) {
  return (
    <MantineLoadingOverlay
      visible={visible}
      transitionProps={{
        duration: 400,
        timingFunction: "ease",
        transition: "fade",
      }}
      zIndex={1000}
      overlayProps={{ blur: 5 }}
      loaderProps={{ color: "teal", type: "bars" }}
    />
  );
}
