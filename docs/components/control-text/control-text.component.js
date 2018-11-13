/* jshint esversion: 6 */

import Component from '../component.js';

class ControlTextComponent extends Component {

    static get styleUrl() {
        return 'components/control-text/control-text.component.css';
    }

    static get templateUrl() {
        return 'components/control-text/control-text.component.html';
    }

    static get observedAttributes() {
        return ['label', 'required', 'control-input-text'];
    }

}

window.customElements.define('control-text-component', ControlTextComponent);