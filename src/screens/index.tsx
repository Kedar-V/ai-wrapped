import type { ComponentType } from 'react';
import type { AnyScreen } from '../data/scripts';
import { ExplainScreen } from './ExplainScreen';
import { LabScreen } from './LabScreen';
import { MatrixScreen } from './MatrixScreen';
import { PersonaScreen } from './PersonaScreen';
import { ThinkScreen } from './ThinkScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { WrappedScreen } from './WrappedScreen';

const Stub = () => <section className="main"><h2 className="disp h2">Coming soon</h2></section>;

export const SCREEN_COMPONENTS: Record<AnyScreen, ComponentType> = {
  welcome: WelcomeScreen, persona: PersonaScreen, wrapped: WrappedScreen, think: ThinkScreen, explain: ExplainScreen,
  lab: LabScreen, matrix: MatrixScreen, trap: Stub, disclosure: Stub, council: Stub, instructor: Stub,
};
