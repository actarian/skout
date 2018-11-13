/* jshint esversion: 6 */

import Component from '../component.js';

class LabelIconLeftComponent extends Component {

    static get styleUrl() {
        return 'components/label-icon-left/label-icon-left.component.css';
    }

    static get templateUrl() {
        return 'components/label-icon-left/label-icon-left.component.html';
    }

    static get observedAttributes() {
        return ['label', 'icon'];
    }

}

window.customElements.define('label-icon-left-component', LabelIconLeftComponent);