import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BrnAccordionItem } from '@spartan-ng/brain/accordion';
import { classes } from '@spartan-ng/helm/utils';

/**
 * One collapsible section. Mirrors React `AccordionItem`.
 */
@Component({
	selector: 'hlm-accordion-item, [hlmAccordionItem]',
	standalone: true,
	template: '<ng-content />',
	changeDetection: ChangeDetectionStrategy.OnPush,
	hostDirectives: [
		{
			directive: BrnAccordionItem,
			inputs: ['isOpened', 'disabled'],
			outputs: ['openedChange', 'stateChange'],
		},
	],
	host: {
		'data-slot': 'accordion-item',
	},
})
export class HlmAccordionItem {
	constructor() {
		classes(() => 'not-last:border-b flex flex-col');
	}
}
