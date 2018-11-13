/* jshint esversion: 6 */

import Component from '../component.js';

class HomeHeroComponent extends Component {

    static get styleUrl() {
        return 'components/home-hero/home-hero.component.css';
    }

    static get templateUrl() {
        return 'components/home-hero/home-hero.component.html';
    }

    static get observedAttributes() {
        return ['home-hero-body'];
    }

}

window.customElements.define('home-hero-component', HomeHeroComponent);