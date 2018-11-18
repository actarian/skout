/* jshint esversion: 6 */

import Component from '../component.js';

class Icon2Component extends Component {

    static get style() {
        return `
:host>.group {
	position: relative;
	width: 100%;
	max-width: 260px;
	min-height: 64px;
	z-index: 0;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css"><img class="group" src="svg/group.svg">
`;
    }

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('icon-2-component', Icon2Component);