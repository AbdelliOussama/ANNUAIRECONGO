import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FicheFormComponent } from './fiche-form.component';

/** /espace/fiche/creer — wraps the shared <ac-fiche-form mode="create" />. */
@Component({
  selector: 'ac-fiche-creer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FicheFormComponent],
  template: `<ac-fiche-form mode="create" />`,
})
export class FicheCreerComponent {}
