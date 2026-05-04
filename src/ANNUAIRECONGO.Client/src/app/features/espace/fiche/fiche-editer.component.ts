import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FicheFormComponent } from './fiche-form.component';

/** /espace/fiche/editer — wraps the shared <ac-fiche-form mode="edit" />. */
@Component({
  selector: 'ac-fiche-editer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FicheFormComponent],
  template: `<ac-fiche-form mode="edit" />`,
})
export class FicheEditerComponent {}
