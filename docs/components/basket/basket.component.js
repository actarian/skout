/* jshint esversion: 6 */

import Component from '../component.js';

class BasketComponent extends Component {

    static get styleUrl() {
        return 'components/basket/basket.component.css';
    }

    static get templateUrl() {
        return 'components/basket/basket.component.html';
    }

    static get observedAttributes() {
        return [];
    }

}

window.customElements.define('basket-component', BasketComponent);