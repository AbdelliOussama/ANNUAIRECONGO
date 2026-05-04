import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * <ac-skip-link> — first focusable element of any layout.
 * Renders a link that's visually hidden until focused, jumping the user
 * straight to the page main landmark.
 */
@Component({
  selector: 'ac-skip-link',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a [href]="'#' + targetId()" class="skip-link">{{ label() }}</a>`,
})
export class SkipLinkComponent {
  readonly targetId = input<string>('main-content');
  readonly label    = input<string>('Aller au contenu principal');
}
