import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BrnAccordion } from '@spartan-ng/brain/accordion';
import { classes } from '@spartan-ng/helm/utils';

/**
 * Root accordion (Spartan Helm). Mirrors React `Accordion` from `accordion.tsx`.
 *
 * @example
 * ```html
 * <hlm-accordion type="single">
 *   <hlm-accordion-item>
 *     <hlm-accordion-trigger>Is it accessible?</hlm-accordion-trigger>
 *     <hlm-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</hlm-accordion-content>
 *   </hlm-accordion-item>
 * </hlm-accordion>
 * ```
 */
@Component({
  selector: 'hlm-accordion, [hlmAccordion]',
  standalone: true,
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: BrnAccordion, inputs: ['type', 'orientation'] }],
  host: {
    'data-slot': 'accordion',
  },
})
export class HlmAccordion {
  constructor() {
    classes(() => 'flex w-full flex-col');
  }
}
