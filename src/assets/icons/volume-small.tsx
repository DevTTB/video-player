import {createIcon} from "@chakra-ui/react";

export const IconVolumeSmall = createIcon({
  displayName: "IconPlay",
  viewBox: "0 0 36 36",
  defaultProps: {
    height: "100%",
    width: "100%",
    fill: "currentColor",
  },
  path: (
    <>
      <defs>
        <clipPath id="volume-animation-mask">
          <path d="m 14.35,-0.14 -5.86,5.86 20.73,20.78 5.86,-5.91 z" />
          <path d="M 7.07,6.87 -1.11,15.33 19.61,36.11 27.80,27.60 z" />
          <path d="M 9.09,5.20 6.47,7.88 26.82,28.77 29.66,25.99 z" />
        </clipPath>
        <clipPath id="volume-animation-slash-mask">
          <path d="m -11.45,-15.55 -4.44,4.51 20.45,20.94 4.55,-4.66 z" />
        </clipPath>
      </defs>
      <path
        clipPath="url(#volume-animation-mask)"
        d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z"
      />
      <path clipPath="url(#volume-animation-slash-mask)" d="M 9.25,9 7.98,10.27 24.71,27 l 1.27,-1.27 Z" />
    </>
  ),
});
