/* jshint esversion: 6 */

import Component from '../component.js';

class ControlInputTextComponent extends Component {

    static get style() {
        return `
.form-control-input-placeholder {
    color: #7F7F7F;
    font-size: 16px;
    font-family: 'GothamHTF-Book';
    letter-spacing: 0;
    text-align: left;
    line-height: 1; }

:host > .value {
    display: block;
    position: absolute;
    width: 276px;
    height: 16px;
    z-index: 1;
    top: 16px;
    left: 15px;
    align-items: flex-start; }`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/grid.css">
<div class="value stext form-control-input-placeholder"><span>Email</span></div>
`;
    }

    static get observedAttributes() {
        return ['value'];
    }

}

window.customElements.define('control-input-text-component', ControlInputTextComponent);