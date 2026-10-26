import type { ComponentType } from 'react';
import { DiscussionBanner } from './components/DiscussionBanner';
import { Footer } from './components/Footer';
import { TopBar } from './components/TopBar';
import { BGS, type AnyScreen } from './data/scripts';
import { useHashRoute } from './hooks';
import { SCREEN_COMPONENTS } from './screens';
import { useAppStore } from './store/useAppStore';

export function App() {
  useHashRoute();
  const screen = useAppStore((s) => s.screen);
  const present = useAppStore((s) => s.present);
  const Screen: ComponentType = SCREEN_COMPONENTS[screen as AnyScreen];
  return (
    <div className="app" style={{ background: BGS[screen], zoom: present ? 1.12 : 1 }}>
      <a className="skip" href="#main">Skip to content</a>
      <TopBar />
      <DiscussionBanner />
      <main id="main" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Screen />
      </main>
      <Footer />
    </div>
  );
}
