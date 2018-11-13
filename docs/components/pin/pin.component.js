/* jshint esversion: 6 */

import Component from '../component.js';

class PinComponent extends Component {

    static get styleUrl() {
        return 'components/pin/pin.component.css';
    }

    static get templateUrl() {
        return 'components/pin/pin.component.html';
    }

    static get observedAttributes() {
        return [];
    }

}

window.customElements.define('pin-component', PinComponent);