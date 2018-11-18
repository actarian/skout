/* jshint esversion: 6 */

import Component from '../component.js';

class WhatsappComponent extends Component {

    static get style() {
        return `
:host>.whatsapp {
	position: relative;
	width: 100%;
	max-width: 24px;
	min-height: 24px;
	z-index: 0;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css"><img class="whatsapp" src="svg/whatsapp.svg">
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('whatsapp-component', WhatsappComponent);