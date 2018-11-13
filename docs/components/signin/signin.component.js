/* jshint esversion: 6 */

import Component from '../component.js';

class SigninComponent extends Component {

    static get styleUrl() {
        return 'components/signin/signin.component.css';
    }

    static get templateUrl() {
        return 'components/signin/signin.component.html';
    }

    static get observedAttributes() {
        return ['form-login'];
    }

}

window.customElements.define('signin-component', SigninComponent);