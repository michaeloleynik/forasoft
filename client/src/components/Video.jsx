import React, { useEffect, useRef } from "react";

export const Video = ({peer}) => {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", stream => {
      ref.current.srcObject = stream;
    })
  }, [peer]);

  return (
      <video style={{width: '300px', height: '225px'}} playsInline autoPlay ref={ref} />
  );
}