import { InstructorControls } from '../components/InstructorControls';

export function InstructorScreen() {
  return (
    <section className="main">
      <div className="eyebrow">Instructor mode · not visible to students unless projected</div>
      <h2 className="disp h2">Facilitation console</h2>
      <InstructorControls />
    </section>
  );
}
