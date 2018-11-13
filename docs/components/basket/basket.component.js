/* jshint esversion: 6 */

import Component from '../component.js';

class BasketComponent extends Component {

    static get style() {
        return `
:host > .basket {
    display: block;
    position: relative;
    width: 24px;
    height: 18px;
    z-index: 0; }`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/grid.css"><img class="basket" src="svg/basket.svg">
`;
    }

    static get observedAttributes() {
        return [];
    }

}

window.customElements.define('basket-component', BasketComponent);