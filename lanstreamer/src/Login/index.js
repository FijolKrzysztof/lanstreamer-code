import React, { Component } from "react";
import { connect } from "react-redux";
import style from "../Home/index.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/fontawesome-free-solid";
import GoogleLogin from "react-google-login";
import axios from "axios";

class Login extends Component {
    constructor(props) {
        super(props);
    }

    onLogin = () => {
        axios.post(window.server + 'api/main/authorize', {AuthorizationString: this.href.substring(this.href.lastIndexOf('/') + 1)})
            .then(() => {
                document.getElementById('warningAlert').style.left = '0px';
                document.getElementById('alertText').innerText = 'YOU CAN CLOSE BROWSER';
                document.getElementById('password').value = '';
            })
            .catch(() => {
                document.getElementById('warningAlert').style.left = '0px';
                document.getElementById('alertText').innerText = 'SERVER ERROR';
                document.getElementById('password').value = '';
            })
    }

    onLoginFailure = () => {
        document.getElementById('warningAlert').style.left = '0px';
        document.getElementById('alertText').innerText = 'LOGIN ERROR';
        document.getElementById('password').value = '';
    }

    render() {
        return (
            <div>
                <GoogleLogin
                    clientId={'634057223675-m245q453mcmhga710vc85asdfi9j74mg.apps.googleusercontent.com'}
                    className={style.loginButton}
                    onSuccess={this.onLogin}
                    onFailure={this.onLoginFailure}
                    cookiePolicy={'single_host_origin'}>
                    <div className={style.loginButtonContentContainer}>
                        <div className={style.loginButtonContent}>Login with Google</div>
                        <FontAwesomeIcon className={style.loginButtonIcon} icon={faArrowRight} />
                    </div>
                </GoogleLogin>
            </div>
        )
    }
}

const mapStateToProps = () => {
    return {};
}

export default connect(mapStateToProps)(Login);
