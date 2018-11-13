/* jshint esversion: 6 */

import Component from '../component.js';

class FormLoginComponent extends Component {

    static get styleUrl() {
        return 'components/form-login/form-login.component.css';
    }

    static get templateUrl() {
        return 'components/form-login/form-login.component.html';
    }

    static get observedAttributes() {
        return ['primary-lg', 'control-text', 'title'];
    }

}

window.customElements.define('form-login-component', FormLoginComponent);