/* jshint esversion: 6 */

import Component from '../component.js';

class BtnIconGhostComponent extends Component {

    static get style() {
        return `
:host > .pin {
    display: block;
    position: relative;
    width: 24px;
    height: 24px;
    z-index: 0;
    padding: 0px 2px 0px 3px; }`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/grid.css">
<icon-component class="pin"></icon-component>
`;
    }

    static get observedAttributes() {
        return ['icon'];
    }

}

window.customElements.define('btn-icon-ghost-component', BtnIconGhostComponent);