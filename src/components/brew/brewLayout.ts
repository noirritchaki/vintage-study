// Where things sit in the brew scene (metres, world space).

import { coneR, DRIPPER_LIFT } from './dripperGeometry';

/** Top of the scale's weighing pad: the carafe stands on it. */
export const SCALE_TOP = 0.035;
/** Everything that stands on the scale is lifted by this much. */
export const STAND = SCALE_TOP;

/** World height of a point `z` metres up the dripper (dripper-local). */
export const dripperY = (z: number) => STAND + DRIPPER_LIFT + z;

/** The dry coffee bed's top and the filter paper's rim. */
export const BED_TOP = dripperY(0.0635);
export const PAPER_GAP = 0.003;
/** Inner radius of the filter paper at world height y. */
export const paperRadiusAt = (y: number) => coneR(y - STAND - DRIPPER_LIFT) - PAPER_GAP;
export const RIM_TOP = dripperY(0.104);

/** Turn the scale so its screen faces the camera's side of the set. */
export const SCALE_YAW = 0.69;
