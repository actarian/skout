/* jshint esversion: 6 */

import Component from '../component.js';

class Icon2Component extends Component {

    static get style() {
        return `
:host > .basket {
    display: block;
    position: absolute;
    width: 24px;
    height: 24px;
    z-index: 1;
    top: 6px;
    left: 6px;
    padding: 3px 0px 3px 0px; }`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/grid.css">
<icon-component class="basket"></icon-component>
`;
    }

    static get observedAttributes() {
        return ['icon'];
    }

}

window.customElements.define('icon-2-component', Icon2Component);