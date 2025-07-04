import { AspectRatio, Box, Flex, IconButton, Slider, Span } from "@chakra-ui/react";
import { FaPlay, FaPause } from "react-icons/fa6";
import { TbPlayerSkipBack, TbPlayerSkipForward } from "react-icons/tb";
import { SlVolume1, SlVolume2, SlVolumeOff } from "react-icons/sl";
import { GoScreenFull } from "react-icons/go";
import { RiFullscreenExitLine } from "react-icons/ri";
import { IoSettingsOutline } from "react-icons/io5";

import { useRef } from "react";
import { useVideoPlayer } from "@/hooks/use-video-player/use-video-player";
import { useHotkeys } from "@/hooks/use-hotkeys/use-hotkeys";

interface IVideoPlayerProps {
    src: string;
}


export const VideoPlayer: React.FC<IVideoPlayerProps> = ({ src }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { videoState, handlePlay, handleFullScreen, handleSeek, handleChangeVolume, formatTime } = useVideoPlayer(videoRef);
    useHotkeys([['space', handlePlay], ['f', () => handleFullScreen(containerRef)]]);

    return (
        <Box position={"relative"} width={"100%"} height={"100%"} ref={containerRef}>

            <Flex width={"100%"} height={"100%"} justify={"center"} onClick={handlePlay} onDoubleClick={() => handleFullScreen(containerRef)} >
                <video ref={videoRef} src={src} />
            </Flex>

            <Box position={"absolute"} bottom={"0px"} width={"100%"}>

                <Slider.Root min={0} max={videoState.duration} onValueChange={(e) => { handleSeek(e.value[0]); }} value={[videoState.currentTime]} size={"sm"} paddingX={"10px"} >
                    <Slider.Control>
                        <Slider.Track bg="rgba(255, 255, 255, .2)">
                            <Slider.Range bg="red.600" />
                        </Slider.Track>
                        <Slider.Thumb index={0} borderColor="red.600" bg={"red.600"} _focusVisible={{ boxShadow: "none" }} >
                        </Slider.Thumb>
                    </Slider.Control>
                </Slider.Root>

                <Flex justify-content={"space-between"} textShadow={"0 0 2px rgba(0,0,0,.5)"}>
                    <Flex flex={'1'}>
                        <IconButton _hover={{ background: "gray" }} variant={"ghost"} color={"white"} size={"2xl"} onClick={handlePlay} >
                            <FaPause strokeWidth={"1.5"} />
                        </IconButton>
                        <IconButton _hover={{ background: "gray" }} variant={"ghost"} color={"white"} size={"2xl"} >
                            <TbPlayerSkipBack strokeWidth={"1.5"} />
                        </IconButton>
                        <IconButton _hover={{ background: "gray" }} variant={"ghost"} color={"white"} size={"2xl"} >
                            <TbPlayerSkipForward strokeWidth={"1.5"} />
                        </IconButton>
                        <IconButton _hover={{ background: "gray" }} variant={"ghost"} color={"white"} size={"2xl"} >
                            <SlVolume1 strokeWidth={"1.5"} />
                        </IconButton>
                        <Flex width={"70px"} alignItems={"center"}>
                            <Slider.Root value={[videoState.volume]} onValueChange={(e) => handleChangeVolume(e.value[0])} max={1} step={0.1} size={"sm"} width={"100%"}>
                                <Slider.Control>
                                    <Slider.Track bg="rgba(255, 255, 255, .2)" height={"4px"}>
                                        <Slider.Range bg="white" />
                                    </Slider.Track>
                                    <Slider.Thumb index={0} borderColor="white" bg={"white"} _focusVisible={{ boxShadow: "none" }} boxSize={3}>
                                    </Slider.Thumb>
                                </Slider.Control>
                            </Slider.Root>
                        </Flex>
                        <Box color={"white"} fontSize={"14px"} display={"flex"} alignItems={"center"}>
                            <Span>{formatTime(videoState.currentTime)}</Span>
                            <Span mx={"6px"}>/</Span>
                            <Span>{formatTime(videoState.duration)}</Span>
                        </Box>
                    </Flex>
                    <Flex>
                        <IconButton _hover={{ background: "gray" }} variant={"ghost"} color={"white"} size={"2xl"} >
                            <IoSettingsOutline strokeWidth={"1.5"} />
                        </IconButton>
                        <IconButton _hover={{ background: "gray" }} variant={"ghost"} color={"white"} size={"2xl"} onClick={() => handleFullScreen(containerRef)}>
                            <GoScreenFull strokeWidth={"1.5"} />
                        </IconButton>
                    </Flex>

                </Flex>
            </Box>
        </Box>
    )
}
