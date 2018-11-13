/* jshint esversion: 6 */

import Component from '../component.js';

class TitleComponent extends Component {

    static get styleUrl() {
        return 'components/title/title.component.css';
    }

    static get templateUrl() {
        return 'components/title/title.component.html';
    }

    static get observedAttributes() {
        return ['text', 'sup'];
    }

}

window.customElements.define('title-component', TitleComponent);