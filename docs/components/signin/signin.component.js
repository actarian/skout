/* jshint esversion: 6 */

import Component from '../component.js';

class SigninComponent extends Component {

    static get style() {
        return `
:host > .container > .form-login {
    display: flex;
    position: relative;
    width: 305px;
    height: 348px;
    z-index: 1;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start; }`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/grid.css">
<div class="container">
	<form-login-component class="form-login" title="title"></form-login-component>
</div>
`;
    }

    static get observedAttributes() {
        return ['form-login'];
    }

}

window.customElements.define('signin-component', SigninComponent);