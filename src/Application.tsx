import React, { useState } from "react";
import {
  Button,
  Card,
  Input,
  Sheet,
  styled,
  TamaguiProvider,
  Theme,
  YStack,
} from "tamagui";
import config from "../tamagui.config";

const TransparentInput = styled(Input, {
  borderColor: "transparent",
  borderWidth: 0,
  outlineColor: "transparent",
  hoverStyle: {
    borderColor: "transparent",
    outlineColor: "transparent",
    borderWidth: 0,
  },
  focusStyle: {
    borderColor: "transparent",
    outlineColor: "transparent",
    borderWidth: 0,
  },
});

export default function Application() {
  const [open, setOpen] = useState(false);

  return (
    <TamaguiProvider
      config={config}
      defaultTheme="light"
    >
      <Theme name="dark">
        <Button onPress={() => setOpen(!open)}>Open Sheet</Button>
        <Card>
          <Sheet
            forceRemoveScrollEnabled={open}
            modal
            open={open}
            onOpenChange={setOpen}
            snapPoints={[85, 50, 25]}
            dismissOnSnapToBottom
          >
            <Sheet.Overlay />
            <Sheet.Handle />
            <Sheet.Frame
              flex={1}
              padding="$4"
              justifyContent="center"
              alignItems="center"
              space="$5"
            >
              <Button onPress={() => setOpen(false)}>Close</Button>
            </Sheet.Frame>
          </Sheet>
        </Card>
      </Theme>
    </TamaguiProvider>
  );
}
