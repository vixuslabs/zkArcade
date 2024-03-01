"use client";

import { Container, Text } from "@react-three/uikit";

import { Button } from "./kits/button";
import { Card, CardContent, CardHeader, CardTitle } from "./kits/card";

export function ConfirmBall() {
  // const [pressed, setPressed] = useState(false)
  return (
    // <Card className="flex flex-col items-center justify-center space-y-4 p-6">
    <Container flexGrow={1}>
      <Card flexDirection="column" alignItems="center" justifyContent="center">
        <CardHeader>
          {/* <CardTitle className="text-center text-2xl font-bold">Is this where you want to place the ball?</CardTitle> */}
          <CardTitle>
            <Text fontSize={14} color="black" marginTop={4}>
              Is this where you want to place the ball?
            </Text>
          </CardTitle>
        </CardHeader>
        <CardContent alignItems={"center"} marginTop={10}>
          {/* <Button className="w-full text-center">Confirm</Button> */}
          <Button width={"100%"} onClick={() => console.log("pressed")}>
            <Text color="black">Confirm</Text>
          </Button>
          <Text color="black">
            Either pick up the ball or press confirm to make the modal
            disappear.
          </Text>
        </CardContent>
      </Card>
    </Container>
  );
}
