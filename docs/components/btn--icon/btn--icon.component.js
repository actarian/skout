/* jshint esversion: 6 */

import Component from '../component.js';

class BtnIconComponent extends Component {

    static get style() {
        return `
:host>.icon {
	position: relative;
	width: 100%;
	max-width: 24px;
	min-height: 24px;
	z-index: 1;
	padding: 3px 0px 3px 0px;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<icon-component class="icon scomponent" data="{&quot;scomponent&quot;:&quot;basket&quot;}"></icon-component>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('btn--icon-component', BtnIconComponent);