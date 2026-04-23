import { HlmAccordion } from './lib/hlm-accordion';
import { HlmAccordionContent } from './lib/hlm-accordion-content';
import { HlmAccordionItem } from './lib/hlm-accordion-item';
import { HlmAccordionTrigger } from './lib/hlm-accordion-trigger';

export * from './lib/hlm-accordion';
export * from './lib/hlm-accordion-content';
export * from './lib/hlm-accordion-item';
export * from './lib/hlm-accordion-trigger';

/** Import this array (or individual classes) into any standalone feature component — same idea as React’s `Accordion` UI kit. */
export const HlmAccordionImports = [HlmAccordion, HlmAccordionItem, HlmAccordionContent, HlmAccordionTrigger] as const;
