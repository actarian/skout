/* jshint esversion: 6 */

import Component from '../component.js';

class BtnIconLabelComponent extends Component {

    static get style() {
        return `
:host>.label-icon {
	position: relative;
	width: 100%;
	max-width: 83px;
	min-height: 24px;
	z-index: 1;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<label-icon-component class="label-icon scomponent" data="{&quot;btn__label&quot;:&quot;Scrivici&quot;,&quot;icon&quot;:{&quot;scomponent&quot;:&quot;whatsapp&quot;},&quot;scomponent&quot;:&quot;label-icon&quot;}"></label-icon-component>
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('btn--icon-label-component', BtnIconLabelComponent);