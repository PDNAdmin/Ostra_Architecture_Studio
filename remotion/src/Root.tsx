import React from 'react';
import { Composition } from 'remotion';
import { InkHouse } from './InkHouse';
import { CostOfChange } from './CostOfChange';
import { Walkthrough } from './Walkthrough';
import { Desk } from './Desk';
import { VIEWS } from '../../site/js/house.js';

// 5 seconds at 30 fps. The site plays 0 to 62% on load, then scroll scrubs the rest.
const FRAMES = 150;

export const Root: React.FC = () => (
  <>
    <Composition id="InkDesktop" component={InkHouse} durationInFrames={FRAMES} fps={30}
      width={VIEWS.desktop.w} height={VIEWS.desktop.h} defaultProps={{ view: 'desktop' as const }} />
    <Composition id="InkMobile" component={InkHouse} durationInFrames={FRAMES} fps={30}
      width={VIEWS.mobile.w} height={VIEWS.mobile.h} defaultProps={{ view: 'mobile' as const }} />
    {/* Closing CTA: the same change at concept, design and build. 8 s, scrubbed by scroll. */}
    <Composition id="ChangeDesktop" component={CostOfChange} durationInFrames={240} fps={30}
      width={1600} height={1000} defaultProps={{ view: 'desktop' as const }} />
    <Composition id="ChangeMobile" component={CostOfChange} durationInFrames={240} fps={30}
      width={1080} height={1080} defaultProps={{ view: 'mobile' as const }} />
    {/* Case study: walk through the courtyard house as a 3D sketch. 16 s at 1080p, scrubbed by scroll;
        also the master for AI video conversion. */}
    <Composition id="WalkSketch" component={Walkthrough} durationInFrames={480} fps={30} width={1920} height={1080} />
    {/* Studio: the five stages as layers landing on a drafting table. 15 s, scrubbed by scroll. */}
    <Composition id="Desk" component={Desk} durationInFrames={450} fps={30} width={1600} height={1000} />
  </>
);
