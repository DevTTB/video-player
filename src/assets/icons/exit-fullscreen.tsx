import {createIcon} from "@chakra-ui/react";

export const IconExitFullScreen = createIcon({
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
        <path d="m 14,14 -4,0 0,2 6,0 0,-6 -2,0 0,4 0,0 z"></path>
      </g>
      <g>
        <path d="m 22,14 0,-4 -2,0 0,6 6,0 0,-2 -4,0 0,0 z"></path>
      </g>
      <g>
        <path d="m 20,26 2,0 0,-4 4,0 0,-2 -6,0 0,6 0,0 z"></path>
      </g>
      <g>
        <path d="m 10,22 4,0 0,4 2,0 0,-6 -6,0 0,2 0,0 z"></path>
      </g>
    </>
  ),
});
