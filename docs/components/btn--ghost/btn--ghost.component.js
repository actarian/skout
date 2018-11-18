/* jshint esversion: 6 */

import Component from '../component.js';

class BtnGhostComponent extends Component {

    static get style() {
        return `
:host>.icon {
	position: relative;
	width: 100%;
	max-width: 24px;
	min-height: 24px;
	z-index: 0;
	padding: 0px 2px 0px 3px;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<icon-component class="icon scomponent" data="{&quot;scomponent&quot;:&quot;pin&quot;}"></icon-component>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('btn--ghost-component', BtnGhostComponent);