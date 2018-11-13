/* jshint esversion: 6 */

import Component from '../component.js';

class ControlInputTextComponent extends Component {

    static get styleUrl() {
        return 'components/control-input-text/control-input-text.component.css';
    }

    static get templateUrl() {
        return 'components/control-input-text/control-input-text.component.html';
    }

    static get observedAttributes() {
        return ['value'];
    }

}

window.customElements.define('control-input-text-component', ControlInputTextComponent);