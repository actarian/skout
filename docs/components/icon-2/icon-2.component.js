/* jshint esversion: 6 */

import Component from '../component.js';

class Icon2Component extends Component {

    static get styleUrl() {
        return 'components/icon-2/icon-2.component.css';
    }

    static get templateUrl() {
        return 'components/icon-2/icon-2.component.html';
    }

    static get observedAttributes() {
        return ['icon'];
    }

}

window.customElements.define('icon-2-component', Icon2Component);