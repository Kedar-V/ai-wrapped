import type { ComponentType } from 'react';
import type { AnyScreen } from '../data/scripts';
import { CouncilScreen } from './CouncilScreen';
import { DisclosureScreen } from './DisclosureScreen';
import { ExplainScreen } from './ExplainScreen';
import { InstructorScreen } from './InstructorScreen';
import { LabScreen } from './LabScreen';
import { MatrixScreen } from './MatrixScreen';
import { PersonaScreen } from './PersonaScreen';
import { ThinkScreen } from './ThinkScreen';
import { TrapScreen } from './TrapScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { WrappedScreen } from './WrappedScreen';

export const SCREEN_COMPONENTS: Record<AnyScreen, ComponentType> = {
  welcome: WelcomeScreen, persona: PersonaScreen, wrapped: WrappedScreen, think: ThinkScreen, explain: ExplainScreen,
  lab: LabScreen, matrix: MatrixScreen, trap: TrapScreen, disclosure: DisclosureScreen, council: CouncilScreen, instructor: InstructorScreen,
};
