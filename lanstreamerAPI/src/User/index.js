import style from './index.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faHome } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router';

const User = () => {
    const History = useHistory();
    const[inputText, setInputText] = useState('New Password');
    const[hideInput, setHideInput] = useState('');
    const[freeTrial, setFreeTrial] = useState('None');
    const[fullVersion, setFullVersion] = useState('None');
    const[renewPayment, setRenewPayment] = useState(false);
    const[inputInfo, setInputInfo] = useState('...');
    const[deleteText, setDeleteText] = useState('Delete Account')

    let timeout;

    useEffect(() => {
        axios.get(window.serverAddress + 'getUserData/' + window.email)
        .then((message) => {
            const currentTime = new Date().getTime();
            const freeTrial = Math.round((new Date(message.data.freeTrial).getTime() - currentTime) / 86400000);
            const fullVersion = Math.round((new Date(message.data.fullVersion).getTime() - currentTime) / 86400000);
            if(message.data.delete !== null) setDeleteText('Undo Deletion');
            setFreeTrial(freeTrial < 0 ? 'None' : freeTrial + ' Days');
            setFullVersion(fullVersion < 0 ? 'None' : fullVersion + ' Days');
        })
        .catch(() => {
            document.getElementById('warningAlert').style.left = '0px';
            document.getElementById('alertText').innerText = 'SERVER ERROR';
        })
    }, [])

    const changeInputs = (type) => {
        const container = document.getElementsByClassName(style.inputContainer)[0];
        const input1 = document.getElementsByClassName(style.inputElementContainer)[1];
        const input2 = document.getElementsByClassName(style.inputElementContainer)[2];
        const text = document.getElementsByClassName(style.inputText)[0];
        if(hideInput === type){
            setHideInput('');
            container.style.opacity = '0';
            setTimeout(() => {
                container.style.display = 'none';
            }, 100)
        } else {
            setHideInput(type);
            container.style.display = 'flex';
            setTimeout(() => {
                container.style.opacity = '1';
            }, 100)
        }
        text.style.transform = 'scaleX(0)';
            setTimeout(() => {
                setInputText(type);
                text.style.transform = 'scaleX(1)';
            }, 150)
        if(type === 'New Password'){
            input1.style.transform = 'scale(1)';
            input2.style.transform = 'scale(1)';
        } else {
            input1.style.transform = 'scale(0)';
            input2.style.transform = 'scale(0)';
        }
    }

    const subscribe = () => {
        axios.get(window.serverAddress + 'subscribe/' + window.email)
        .then((message) => {
            if(message.data === ''){
                document.getElementById('warningAlert').style.left = '0px';
                document.getElementById('alertText').innerText = 'ALREADY SUBSCRIBED';
            } else {
                setFullVersion(message.data + ' Days');
            }
        })
        .catch(() => {
            document.getElementById('warningAlert').style.left = '0px';
            document.getElementById('alertText').innerText = 'SERVER ERROR';
        })
    }

    const home = () => {
        History.push('/login/');
    }

    const switchRenewPayment = () => {
        setRenewPayment(!renewPayment);
    }

    const input = () => {
        const password = document.getElementsByClassName(style.input)[0].value;
        const newPassword = document.getElementsByClassName(style.input)[1].value;
        const confirmPassword = document.getElementsByClassName(style.input)[2].value;

        if(inputText === 'New Password'){
            if(password === '') animateText('Password field empty.');
            else if(newPassword === '') animateText('New Password field empty.');
            else if(confirmPassword === '') animateText('Confirm Password field empty.');
            else if(newPassword.length < 8) animateText('Password too short.');
            else if(newPassword.length > 20) animateText('Password too long.');
            else if(confirmPassword !== newPassword) animateText('Wrong password confirmation.');
            else {
                axios.get(window.serverAddress + 'changePassword/' + window.email + '/' + password + '/' + newPassword)
                .then((message) => {
                    animateText(message.data);
                })
                .catch(() => animateText('Server error.'))
            }
        } else if(inputText === 'Delete Account'){
            axios.get(window.serverAddress + 'deleteAccount/' + window.email + '/' + password)
            .then((message) => {
                if(message.data !== ''){
                    animateText(message.data);
                } else {
                    animateText('Account will be deleted in 1 day.');
                    setDeleteText('Undo Deletion');
                    changeInputs('Undo Deletion');
                }
            })
            .catch(() => animateText('Server error.'))
        } else if(inputText === 'Undo Deletion'){
            axios.get(window.serverAddress + 'undoDeletion/' + window.email + '/' + password)
            .then((message) => {
                if(message.data !== ''){
                    animateText(message.data);
                } else {
                    animateText('Deletion stopped.');
                    setDeleteText('Delete Account');
                    changeInputs('Delete Account');
                }
            })
            .catch(() => animateText('Server error.'))
        }

        document.getElementsByClassName(style.input)[0].value = '';
        document.getElementsByClassName(style.input)[1].value = '';
        document.getElementsByClassName(style.input)[2].value = '';
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

    const resetDevice = () => {
        axios.get(window.serverAddress + 'resetDevice/' + window.email)
        .then((message) => {
            document.getElementById('warningAlert').style.left = '0px';
            document.getElementById('alertText').innerText = message.data;
        })
        .catch(() => {
            document.getElementById('warningAlert').style.left = '0px';
            document.getElementById('alertText').innerText = 'SERVER ERROR';
        })
    }

    return(
        <div className={ style.user }>
            <div className={ style.mainContainer }>
                <button className={ style.home } onClick={ home }>
                    <FontAwesomeIcon icon={ faHome } />
                </button>
                <div className={ style.infoContainer }>
                    <div className={ style.optionContainer }>
                        <div className={ style.optionHeader }>Free Trial:</div>
                        <div className={ style.optionInfo }>{ freeTrial }</div>
                    </div>
                    <div className={ style.optionContainer }>
                        <div className={ style.optionHeader }>Full Version:</div>
                        <div className={ style.optionInfo }>{ fullVersion }</div>
                    </div>
                </div>
                <div className={ style.paymentContainer }>
                    <button className={ style.paymentButton } onClick={ subscribe }>Get Full Version</button>
                    <div className={ style.subscriptionContainer }>
                        <div className={ style.subscriptionInfo }>Auto Renew Payment:</div>
                        <button className={ style.checkButton } onClick={ switchRenewPayment }>
                            { renewPayment === false ? null : <FontAwesomeIcon icon={ faCheck } /> }
                        </button>
                    </div>
                </div>
                <button className={ style.resetButton } onClick={ resetDevice }>Reset Device</button>
                <div className={ style.accountContainer }>
                    <button className={ style.accountButton } onClick={() => changeInputs('New Password')}>NEW PASSWORD</button>
                    <button className={ style.accountButton } onClick={() => changeInputs(deleteText)}>{ deleteText.toUpperCase() }</button>
                </div>
            </div>
            <div className={ style.inputContainer }>
                <div className={ style.inputText }>{ inputText }</div>
                <div className={ style.inputElementContainer }>
                    <input className={ style.input } type='password' />
                    <div className={ style.placeholder }>Password</div>
                </div>
                <div className={ style.inputElementContainer }>
                    <input className={ style.input } type='password' />
                    <div className={ style.placeholder }>New Password</div>
                </div>
                <div className={ style.inputElementContainer }>
                    <input className={ style.input } type='password' />
                    <div className={ style.placeholder }>Confirm Password</div>
                </div>
                <div className={ style.inputBottomContainer }>
                    <div className={ style.inputInfo }>{ inputInfo }</div>
                    <button className={ style.inputButton } onClick={ input }>
                        <FontAwesomeIcon icon={ faCheck } />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default User;
