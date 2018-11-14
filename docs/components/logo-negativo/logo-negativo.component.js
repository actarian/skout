/* jshint esversion: 6 */

import Component from '../component.js';

class LogoNegativoComponent extends Component {

    static get style() {
        return `
:host>.logo-negativo {
	display: block;
	position: relative;
	width: 260px;
	height: 64px;
	z-index: 0;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css"><img class="logo-negativo" src="svg/logo-negativo.svg">
`;
    }

    static get observedAttributes() {
        return ['data']; // [];
    }

}

window.customElements.define('logo-negativo-component', LogoNegativoComponent);