import {createIcon} from "@chakra-ui/react";

export const IconFullScreen = createIcon({
  displayName: "IconPlay",
  viewBox: "0 0 36 36",
  defaultProps: {
    height: "100%",
    width: "100%",
    fill: "currentColor",
  },
  path: (
    <>
      <g>
        <path d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"></path>
      </g>
      <g>
        <path d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z"></path>
      </g>
      <g>
        <path d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"></path>
      </g>
      <g>
        <path d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"></path>
      </g>
    </>
  ),
});
