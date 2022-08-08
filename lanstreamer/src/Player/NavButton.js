import React, { Component } from 'react';
import style from './NavButton.module.scss';

class NavButton extends Component {
    changeVideo = () => {
        this.props.changeVideo(this.props.name);
    }

    render(){
        return(
            <div className={ style.navButton }>
                <div className={ style.button } onClick={ this.changeVideo }>
                    { this.props.name.slice(0, -4).length > 30 ? this.props.name.slice(0, 30) + '...' : this.props.name.slice(0, -4) }
                </div>
            </div>
        );
    }
}
 
export default NavButton;
