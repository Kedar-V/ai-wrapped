import type { ComponentType } from 'react';
import type { AnyScreen } from '../data/scripts';

const Stub = () => <section className="main"><h2 className="disp h2">Coming soon</h2></section>;

export const SCREEN_COMPONENTS: Record<AnyScreen, ComponentType> = {
  welcome: Stub, persona: Stub, wrapped: Stub, think: Stub, explain: Stub, lab: Stub, matrix: Stub, trap: Stub, disclosure: Stub, council: Stub, instructor: Stub,
};
