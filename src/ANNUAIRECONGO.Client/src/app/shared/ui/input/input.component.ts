import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  HostBinding,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

let _uid = 0;
const nextId = () => `ac-input-${++_uid}`;

export type InputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'search';

/**
 * <ac-input> — text input with label, hint, error, optional leading icon
 * and a built-in show/hide toggle for type="password".
 *
 * Usage with Reactive Forms:
 *   <ac-input formControlName="email" type="email" label="Adresse e-mail" leadingIcon="mail" />
 *
 * Usage with template-driven forms:
 *   <ac-input [(ngModel)]="value" label="Nom" />
 *
 * The component implements ControlValueAccessor so it slots into either flow.
 * Errors are passed in via [error]; the input itself does not assume any
 * validator — surface validation messages from the parent FormGroup.
 */
@Component({
  selector: 'ac-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-group">
      @if (label()) {
        <label class="form-label" [attr.for]="inputId">
          {{ label() }}
          @if (required()) { <span class="text-error" aria-hidden="true">*</span> }
        </label>
      }

      <div class="form-input-icon" [class.relative]="type() === 'password'">
        @if (leadingIcon()) {
          <span class="material-symbols-outlined" aria-hidden="true">{{ leadingIcon() }}</span>
        }

        <input
          [id]="inputId"
          [type]="effectiveType()"
          [value]="value()"
          [placeholder]="placeholder() || ''"
          [autocomplete]="autocomplete() || 'off'"
          [attr.inputmode]="inputmode() || null"
          [attr.pattern]="pattern() || null"
          [attr.minlength]="minlength() || null"
          [attr.maxlength]="maxlength() || null"
          [attr.aria-invalid]="!!error() || null"
          [attr.aria-required]="required() || null"
          [attr.aria-describedby]="describedBy()"
          [disabled]="disabled()"
          [required]="required()"
          class="form-input"
          (input)="onInput($event)"
          (blur)="onBlurred()"
        />

        @if (type() === 'password') {
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary p-1"
            [attr.aria-label]="visiblePassword() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
            (click)="togglePasswordVisibility()"
          >
            <span class="material-symbols-outlined text-xl" aria-hidden="true">
              {{ visiblePassword() ? 'visibility_off' : 'visibility' }}
            </span>
          </button>
        }
      </div>

      @if (hint() && !error()) {
        <p [id]="hintId" class="text-xs text-outline">{{ hint() }}</p>
      }
      @if (error()) {
        <p [id]="errorId" class="form-error" role="alert" aria-live="polite">{{ error() }}</p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .relative { position: relative; }
  `],
})
export class InputComponent implements ControlValueAccessor {
  readonly inputId = nextId();
  readonly hintId  = `${this.inputId}-hint`;
  readonly errorId = `${this.inputId}-error`;

  readonly label        = input<string | null>(null);
  readonly placeholder  = input<string | null>(null);
  readonly type         = input<InputType>('text');
  readonly leadingIcon  = input<string | null>(null);
  readonly hint         = input<string | null>(null);
  readonly error        = input<string | null>(null);
  readonly required     = input<boolean>(false);
  readonly autocomplete = input<string | null>(null);
  readonly inputmode    = input<string | null>(null);
  readonly pattern      = input<string | null>(null);
  readonly minlength    = input<number | null>(null);
  readonly maxlength    = input<number | null>(null);

  protected readonly value            = signal<string>('');
  protected readonly disabled         = signal<boolean>(false);
  protected readonly visiblePassword  = signal<boolean>(false);

  protected readonly effectiveType = computed<InputType>(() =>
    this.type() === 'password' && this.visiblePassword() ? 'text' : this.type()
  );

  protected readonly describedBy = computed(() => {
    const parts: string[] = [];
    if (this.hint() && !this.error()) parts.push(this.hintId);
    if (this.error()) parts.push(this.errorId);
    return parts.length ? parts.join(' ') : null;
  });

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected onInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  protected onBlurred(): void {
    this.onTouched();
  }

  protected togglePasswordVisibility(): void {
    this.visiblePassword.update((v) => !v);
  }

  /* ── ControlValueAccessor ── */
  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }
}
