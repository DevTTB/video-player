import {VideoPlayer} from "@/components/video-player";
import {Box} from "@chakra-ui/react";

export const App = () => {
  return (
    <Box width={"100%"} height={"56.25vw"} maxHeight={"calc(100vh - 169px)"} backgroundColor={"black"}>
      <VideoPlayer src={"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} />
    </Box>
  );
};
