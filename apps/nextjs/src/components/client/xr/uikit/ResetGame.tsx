"use client";

import { Container, Text } from "@react-three/uikit";

import { Button } from "./kits/button";
import { Card } from "./kits/card";

export function ResetGame() {
  // const [pressed, setPressed] = useState(false)
  return (
    // <Card className="flex flex-col items-center justify-center space-y-4 p-6">
    <Container>
      <Card
        flexGrow={1}
        maxWidth={448}
        marginX="auto"
        borderRadius={12}
        overflow={"hidden"}
        margin={16}
        alignContent={"center"}
        flexDirection="column"
        padding={32}
      >
        <Container flexDirection={"column"} alignItems={"center"}>
          <Text color="#6366F1">Game Winner</Text>
          <Text color="black">
            You have successfully completed the game with the highest score.
            Well done!
          </Text>
        </Container>

        <Container
          marginX={16}
          gap={16}
          justifyContent={"center"}
          marginY={16}
          display={"flex"}
          flexDirection={"row"}
        >
          <Button
            backgroundColor={"red"}
            height={40}
            justifyContent="center"
            alignContent={"center"}
          >
            <Text color="black">Reset</Text>
          </Button>

          <Button height={40} justifyContent="center" alignContent={"center"}>
            <Text color="black">Home</Text>
          </Button>
        </Container>
      </Card>
    </Container>
  );
}
