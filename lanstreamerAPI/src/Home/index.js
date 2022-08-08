import style from './index.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faDownload } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router';

const Home = () => {
    const History = useHistory();
    const[inputText, setInputText] = useState('Register');
    const[inputInfo, setInputInfo] = useState('...');

    let timeout;
    let focusTimeout;

    const ref = useRef(false)
    useEffect(() => {
        ref.current = true;
        return () => {
            ref.current = false;
        }
    }, [])

    const confirm = () => {
        const email = document.getElementsByClassName(style.input)[0].value;
        const password = document.getElementsByClassName(style.input)[1].value;
        const confirmPassword = document.getElementsByClassName(style.input)[2].value;

        if(inputText === 'Register'){
            if(email === '') animateText('E-mail field empty.');
            else if(password === '') animateText('Password field empty.');
            else if(password.length < 8) animateText('Password too short.');
            else if(password.length > 20) animateText('Password too long.');
            else if(confirmPassword !== password) animateText('Wrong password confirmation.');
            else {
                const re = /\S+@\S+\.\S+/;
                if(re.test(email) === false) animateText('Wrong E-mail.');
                else axios.get(window.serverAddress + 'checkIfMailExists/' + email)
                .then(message => {
                    if(message.data === true) animateText('E-mail already exists.');
                    else{
                        axios.get(window.serverAddress + 'sendMail/' + password + '/' + email)
                        .then(() => {
                            document.getElementsByClassName(style.input)[0].value = '';
                            document.getElementsByClassName(style.input)[1].value = '';
                            document.getElementsByClassName(style.input)[2].value = '';
                            animateText('Success. Check your e-mail.')
                            setTimeout(() => {
                                document.getElementsByClassName(style.confirmation)[0].style.display = 'block';
                                window.email = email;
                            }, 3000)
                        })
                        .catch(() => animateText('Server error.'))
                    }
                })
                .catch(() => animateText('Server error.'))
            }
        }
        else if(inputText === 'Login'){
            axios.get(window.serverAddress + 'login/' + email + '/' + password)
            .then((message) => {
                if(message.data !== ''){
                    animateText(message.data);
                } else {
                    window.email = email;
                    History.push('/login/user');
                }
            })
            .catch(() => animateText('Server error.'))
        }

        document.getElementsByClassName(style.inputButton)[0].disabled = true;
        setTimeout(() => {
            document.getElementsByClassName(style.inputButton)[0].disabled = false;
        }, 2000)
    }

    const animateText = (text, count = 0) => {
        clearTimeout(timeout);
        if(count < text.length + 1){
            setInputInfo(text.slice(0, count));
            count ++;
            timeout = setTimeout(() => {
                animateText(text, count);
            }, 50)
        }
    }

    const changeInputs = (type) => {
        const input = document.getElementsByClassName(style.inputElementContainer)[2];
        const text = document.getElementsByClassName(style.inputText)[0];

        text.style.transform = 'scaleX(0)';
        setTimeout(() => {
            setInputText(type);
            text.style.transform = 'scaleX(1)';
        }, 150)

        if(type === 'Register'){
            input.style.transform = 'scale(1)';
        } else {
            input.style.transform = 'scale(0)';
        }
    }

    const downlaod = (type) => {
        document.getElementsByClassName(style.downloadButton)[0].disabled = true;
        document.getElementsByClassName(style.downloadButton)[1].disabled = true;
        document.getElementsByClassName(style.downloadButton)[2].disabled = true;
        document.body.style.cursor = 'wait';
        axios.get(window.serverAddress + 'download/' + type, { responseType: 'blob' })
        .then((file) => {
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = URL.createObjectURL(new File([file.data], '.zip', { type: 'application/zip' }));
            link.download = 'lanstreamer';

            document.body.appendChild(link);
            link.click();

            document.body.style.cursor = 'auto';
            document.getElementsByClassName(style.downloadButton)[0].disabled = false;
            document.getElementsByClassName(style.downloadButton)[1].disabled = false;
            document.getElementsByClassName(style.downloadButton)[2].disabled = false;

            setTimeout(() => {
                URL.revokeObjectURL(link.href);
                link.parentNode.removeChild(link);
            });
        })
        .catch(() => {
            document.body.style.cursor = 'auto';
            document.getElementsByClassName(style.downloadButton)[0].disabled = false;
            document.getElementsByClassName(style.downloadButton)[1].disabled = false;
            document.getElementsByClassName(style.downloadButton)[2].disabled = false;
        })
    }

    const confirmation = (e, number) => {
        setTimeout(() => {
            if(e.keyCode === 13){
                let code = [];
                for(let i = 0; i < 8; i ++){
                    code.push(document.getElementsByClassName(style.confirmationInput)[i].value);
                }
                code = code.join('')
                document.getElementsByClassName(style.confirmation)[0].style.display = 'none';
                for(let i = 0; i < 8; i ++){
                    document.getElementsByClassName(style.confirmationInput)[i].value = '';
                }
                axios.get(window.serverAddress + 'checkConfirmation/' + code)
                .then((data) => {
                    const message = data.data;
                    if(message === ''){
                        History.push('/login/user');
                    } else {
                        animateText(message);
                        setTimeout(() => {
                            document.getElementsByClassName(style.confirmation)[0].style.display = 'block';
                        }, 1000)
                    }
                })
                .catch(() => animateText('Server error.'))
            } else if(e.keyCode === 8){
                if(number !== 0) document.getElementsByClassName(style.confirmationInput)[number - 1].focus();
            } else if(e.keyCode === 37 && number !== 0){
                document.getElementsByClassName(style.confirmationInput)[number - 1].focus();
            } else if(e.keyCode === 39 && number !== 7){
                document.getElementsByClassName(style.confirmationInput)[number + 1].focus();
            } else if(number !== 7){
                document.getElementsByClassName(style.confirmationInput)[number + 1].focus();
            }
        })
    }

    const changeFocus = (focus) => {
        let hasValue = false;
        for(let i = 0; i < 8; i ++){
            if(document.getElementsByClassName(style.confirmationInput)[i].value !== '') hasValue = true;
        }
        if(focus === true){
            clearTimeout(focusTimeout);
            document.getElementsByClassName(style.confirmationPlaceholder)[0].style.color = 'rgba(0, 0, 0, 0)';
        } else if(hasValue === false){
            focusTimeout = setTimeout(() => {
                if(ref.current) document.getElementsByClassName(style.confirmationPlaceholder)[0].style.color = 'rgba(0, 0, 0, .6)';
            }, 200)
        }
    }

    const confirmationInputs = [];

    for(let i = 0; i < 8; i ++){
        confirmationInputs.push( <input className={ style.confirmationInput } maxLength='1' key={ 'confirmationInput' + i }
            onKeyDown={(e) => confirmation(e, i)} 
            onFocus={() => changeFocus(true)}
            onBlur={() => changeFocus(false)}
        /> );
    }

    return(
        <div className={ style.home }>
            <div className={ style.confirmation }>
                <div className={ style.confirmationContainer }>
                    { confirmationInputs }
                    <div className={ style.confirmationPlaceholder }>Confirmation Code</div>
                </div>
            </div>
            <div className={ style.help }>support@lanstreamer.com</div> 
            <a href='/'>
                <button className={ style.demo }>Demo</button>
            </a>
            <div className={ style.inputContainer }>
                <div className={ style.inputText }>{ inputText }</div>
                <div className={ style.inputElementContainer }>
                    <input className={ style.input } />
                    <div className={ style.placeholder }>E-mail</div>
                </div>
                <div className={ style.inputElementContainer }>
                    <input className={ style.input } type='password' />
                    <div className={ style.placeholder }>Password</div>
                </div>
                <div className={ style.inputElementContainer }>
                    <input className={ style.input } type='password' />
                    <div className={ style.placeholder }>Confirm Password</div>
                </div>
                <div className={ style.inputBottomContainer }>
                    <div className={ style.inputInfo }>{ inputInfo }</div>
                    <button className={ style.inputButton } onClick={ confirm }>
                        <FontAwesomeIcon style={{ pointerEvents: 'none' }} icon={ faCheck } />
                    </button>
                </div>
                <div className={ style.loginButtons }>
                    <button className={ style.login } onClick={() => changeInputs('Login')}>
                        <div className={ style.wave }></div>
                        <div className={ style.loginText }>LOGIN</div>
                    </button>
                    <button className={ style.login } onClick={() => changeInputs('Register')}>
                        <div className={ style.wave }></div>
                        <div className={ style.loginText }>REGISTER</div>
                    </button>
                </div>
            </div>
            <div className={ style.useOptions }>
                <div className={ style.useOption }>
                    <div className={ style.header }>Free Trial</div>
                    <div className={ style.container }>
                        <div className={ style.left }>Price:</div>
                        <div className={ style.right }>Free</div>
                    </div>
                    <div className={ style.container }>
                        <div className={ style.left }>Time:</div>
                        <div className={ style.right }>30 Days</div>
                    </div>
                    <div className={ style.container }>
                        <div className={ style.left }>Requirements:</div>
                        <div className={ style.right }>Registration</div>
                    </div>
                    <div className={ style.container }>
                        <div className={ style.left }>Offline:</div>
                        <div className={ style.right }>No</div>
                    </div>
                    <div className={ style.container }>
                        <div className={ style.left }>Device Change:</div>
                        <div className={ style.right }>No</div>
                    </div>
                </div>
                <div className={ style.useOption }>
                    <div className={ style.header }>Full Version</div>
                    <div className={ style.container }>
                        <div className={ style.left }>Price:</div>
                        <div className={ style.right }>Free</div>
                    </div>
                    <div className={ style.container }>
                        <div className={ style.left }>Time:</div>
                        <div className={ style.right }>Unlimited</div>
                    </div>
                    <div className={ style.container }>
                        <div className={ style.left }>Requirements:</div>
                        <div className={ style.right }>Registration</div>
                    </div>
                    <div className={ style.container }>
                        <div className={ style.left }>Offline:</div>
                        <div className={ style.right }>Yes</div>
                    </div>
                    <div className={ style.container }>
                        <div className={ style.left }>Device Change:</div>
                        <div className={ style.right }>Yes</div>
                    </div>
                </div>
            </div>
            <div className={ style.downloadContainer }>
                <div className={ style.downloadHeader }>Download</div>
                <div className={ style.downloadOptionContainer }>
                    <div className={ style.downloadText }>WINDOWS</div>
                    <button className={ style.downloadButton } onClick={() => downlaod('windows')}>
                        <FontAwesomeIcon icon={ faDownload } />
                    </button>
                    <div className={ style.downloadInfo }></div>
                </div>
                <div className={ style.downloadOptionContainer }>
                    <div className={ style.downloadText }>MAC</div>
                    <button className={ style.downloadButton } onClick={() => downlaod('mac')}>
                        <FontAwesomeIcon icon={ faDownload } />
                    </button>
                    <div className={ style.downloadInfo }>( Unavailable )</div>
                </div>
                <div className={ style.downloadOptionContainer }>
                    <div className={ style.downloadText }>LINUX</div>
                    <button className={ style.downloadButton } onClick={() => downlaod('linux')}>
                        <FontAwesomeIcon icon={ faDownload } />
                    </button>
                    <div className={ style.downloadInfo }></div>
                </div>
            </div>
        </div>
    );
}

export default Home;
