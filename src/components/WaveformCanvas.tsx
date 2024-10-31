import React, { forwardRef } from 'react';

export const WaveformCanvas = forwardRef<HTMLCanvasElement>((props, ref) => (
  <canvas
    ref={ref}
    width={800}
    height={80}
    className="w-full h-12"
    {...props}
  />
));