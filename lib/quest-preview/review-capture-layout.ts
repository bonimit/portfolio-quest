export const REVIEW_CAPTURE_VERSION=32;
/** Applied by the review-only page, so captures retain one format during hot reloads. */
export const REVIEW_CAPTURE_STYLES=`
.scene-study.quest-preview[data-screenshot="true"]{width:1440px;height:calc(980px - var(--site-header-height,64px));min-height:calc(980px - var(--site-header-height,64px));}
.scene-study[data-screenshot="true"],.scene-study[data-screenshot="true"] *,.scene-study[data-screenshot="true"] *::before,.scene-study[data-screenshot="true"] *::after{transition:none!important;animation:none!important;}
.scene-study[data-screenshot="true"] .scene-study-stage{width:1440px;max-width:none;}
.scene-study[data-screenshot="true"] .scene-study-label{display:none!important;}
.scene-study[data-screenshot="true"] .scene-study-heading h1{font-size:100.8px;}
.scene-study[data-screenshot="true"] .scene-study-heading p{font-size:15.2px;max-width:none;margin:.5rem 0 0;}
.scene-study[data-screenshot="true"] .scene-study-destination strong{font-size:28.8px;}
.scene-study[data-screenshot="true"] .scene-study-destination small{font-size:11.52px;letter-spacing:.04em;}
.scene-study[data-screenshot="true"] .scene-study-destination--concepts>.scene-study-label{left:calc(25% - 2cqw);top:-2.5cqw;bottom:auto;transform:translate(-50%,-100%);text-align:center;}
.scene-study[data-screenshot="true"] .scene-study-destination--world>.scene-study-label{left:calc(25% + 10cqw);top:-2.5cqw;bottom:auto;transform:translate(-50%,-100%);text-align:center;}
.scene-study[data-screenshot="true"] .scene-study-destination--portfolio>.scene-study-label{bottom:calc(100% + 1.4rem);}
.scene-study[data-screenshot="true"] .scene-study-caption{flex-direction:row;gap:.8rem;}
.scene-study[data-screenshot="true"] .scene-study-caption .quest-scene-caption{max-width:520px;white-space:nowrap;font-size:12px;}
.scene-study[data-screenshot="true"] .scene-study-motion{font-size:12px;}
.scene-study[data-screenshot="true"] .scene-study-tools{align-items:center;}
.scene-study[data-screenshot="true"] .scene-study-orbit-help{font-size:11.2px;bottom:3rem;}
`;
