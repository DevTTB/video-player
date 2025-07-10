import {Box, createListCollection, Flex, IconButton, Popover, Portal, Select, Slider, Span} from "@chakra-ui/react";
import {useRef} from "react";
import {useVideoPlayer} from "@/hooks/use-video-player/use-video-player";
import {useHotkeys} from "@/hooks/use-hotkeys/use-hotkeys";
import {
  IconExitFullScreen,
  IconFullScreen,
  IconPause,
  IconPlay,
  IconSetting,
  IconVolumeLarge,
  IconVolumeMuted,
  IconVolumeSmall,
} from "@/assets/icons";
import {IconSkipBack} from "@/assets/icons/skip-back";
import {IconSkipFoward} from "@/assets/icons/skip-forward";
import { images } from "@/assets/images";

interface IVideoPlayerProps {
  src: string;
}

const PLAYBACK_RATE_OPTIONS = [
  {label: "0.25x", value: 0.25},
  {label: "0.5x", value: 0.5},
  {label: "0.75x", value: 0.75},
  {label: "1x", value: 1},
  {label: "1.25x", value: 1.25},
  {label: "1.5x", value: 1.5},
  {label: "1.75x", value: 1.75},
  {label: "2x", value: 2},
];

export const VideoPlayer: React.FC<IVideoPlayerProps> = ({src}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    videoState,
    handlePlay,
    handleFullScreen,
    handleSeek,
    handleChangeVolume,
    hanldeMute,
    handlePlaybackRate,
    handleShowControls,
    formatTime,
  } = useVideoPlayer(videoRef);

  useHotkeys([
    ["space", handlePlay],
    ["f", () => handleFullScreen(containerRef)],
    ["arrowLeft", () => handleSeek(videoState.currentTime - 5)],
    ["arrowRight", () => handleSeek(videoState.currentTime + 5)],
    ["arrowUp", () => handleChangeVolume(Math.min(videoState.volume + 0.1, 1))],
    ["arrowDown", () => handleChangeVolume(Math.max(videoState.volume - 0.1, 0))],
    ["m", hanldeMute],
  ]);

  return (
    <Box
      position={"relative"}
      width={"100%"}
      height={"100%"}
      ref={containerRef}
      onMouseEnter={() => videoState.isPlaying && handleShowControls(true)}
      onMouseLeave={() => videoState.isPlaying && handleShowControls(false)}
    >
      <Flex
        width={"100%"}
        height={"100%"}
        justify={"center"}
        onClick={handlePlay}
        onDoubleClick={() => handleFullScreen(containerRef)}
      >
        <video ref={videoRef} src={src} />
      </Flex>

      <Box
        height={"54px"}
        bottom={"0"}
        backgroundPosition={"bottom"}
        backgroundImage={`url('${images.gradientBottom}')`}
        backgroundRepeat={"repeat-x"}
        position={"absolute"}
        width={"100%"}
        pointerEvents={"none"}
        visibility={videoState.isShowControls ? "visible" : "hidden"}
      />
      <Box
        position={"absolute"}
        bottom={"0px"}
        width={"100%"}
        visibility={videoState.isShowControls ? "visible" : "hidden"}
      >
        <Slider.Root
          min={0}
          max={videoState.duration}
          onValueChange={(e) => {
            handleSeek(e.value[0]);
          }}
          value={[videoState.currentTime]}
          size={"sm"}
          paddingX={"10px"}
        >
          <Slider.Control>
            <Slider.Track bg="rgba(255, 255, 255, .2)">
              <Slider.Range bg="red.600" />
            </Slider.Track>
            <Slider.Thumb
              visibility={"unset !important"}
              index={0}
              borderColor="red.600"
              bg={"red.600"}
              _focusVisible={{boxShadow: "none"}}
            ></Slider.Thumb>
          </Slider.Control>
        </Slider.Root>

        <Flex justify-content={"space-between"} textShadow={"0 0 2px rgba(0,0,0,.5)"}>
          <Flex flex={"1"}>
            <IconButton
              _hover={{background: "none"}}
              variant={"ghost"}
              color={"white"}
              size={"xl"}
              onClick={handlePlay}
            >
              {videoState.isPlaying ? <IconPause /> : <IconPlay />}
            </IconButton>
            <IconButton
              onClick={() => handleSeek(videoState.currentTime - 5)}
              _hover={{background: "none"}}
              variant={"ghost"}
              color={"white"}
              size={"xl"}
            >
              <IconSkipBack strokeWidth={"1.5"} />
            </IconButton>
            <IconButton
              onClick={() => handleSeek(videoState.currentTime + 5)}
              _hover={{background: "none"}}
              variant={"ghost"}
              color={"white"}
              size={"xl"}
            >
              <IconSkipFoward strokeWidth={"1.5"} />
            </IconButton>
            <IconButton
              _hover={{background: "none"}}
              variant={"ghost"}
              color={"white"}
              size={"xl"}
              onClick={hanldeMute}
            >
              {videoState.isMuted || videoState.volume == 0 ? (
                <IconVolumeMuted />
              ) : videoState.volume >= 0.5 ? (
                <IconVolumeLarge />
              ) : (
                <IconVolumeSmall />
              )}
            </IconButton>
            <Flex width={"70px"} alignItems={"center"}>
              <Slider.Root
                value={[videoState.volume]}
                onValueChange={(e) => handleChangeVolume(e.value[0])}
                max={1}
                step={0.1}
                size={"sm"}
                width={"100%"}
              >
                <Slider.Control>
                  <Slider.Track bg="rgba(255, 255, 255, .2)" height={"4px"}>
                    <Slider.Range bg="white" />
                  </Slider.Track>
                  <Slider.Thumb
                    visibility={"unset !important"}
                    index={0}
                    borderColor="white"
                    bg={"white"}
                    _focusVisible={{boxShadow: "none"}}
                    boxSize={3}
                  ></Slider.Thumb>
                </Slider.Control>
              </Slider.Root>
            </Flex>
            <Box paddingLeft={"12px"} color={"white"} fontSize={"14px"} display={"flex"} alignItems={"center"}>
              <Span>{formatTime(videoState.currentTime)}</Span>
              <Span mx={"6px"}>/</Span>
              <Span>{formatTime(videoState.duration)}</Span>
            </Box>
          </Flex>

          <Flex>
            <Popover.Root size="xs" positioning={{placement: "top"}}>
              <Popover.Trigger asChild>
                <IconButton _hover={{background: "none"}} variant={"ghost"} color={"white"} size={"xl"}>
                  <IconSetting />
                </IconButton>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content>
                    <Popover.Body>
                      <Select.Root
                        collection={createListCollection({items: PLAYBACK_RATE_OPTIONS})}
                        size="sm"
                        positioning={{sameWidth: true, placement: "top"}}
                        onSelect={(e) => handlePlaybackRate(e.value as unknown as number)}
                      >
                        <Select.Control>
                          <Select.Trigger border={"none"}>
                            Playback Rate
                            <Select.ValueText />
                          </Select.Trigger>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content width="full">
                            {PLAYBACK_RATE_OPTIONS.map((item) => (
                              <Select.Item item={item} key={item.value}>
                                {item.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
            <IconButton
              _hover={{background: "none"}}
              variant={"ghost"}
              color={"white"}
              size={"xl"}
              onClick={() => handleFullScreen(containerRef)}
            >
              {videoState.isFullScreen ? <IconExitFullScreen /> : <IconFullScreen />}
            </IconButton>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};
