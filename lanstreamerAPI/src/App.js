import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.scss';
import Home from './Home';
import User from './User';

const App = () => {
  const closeAlert = () => {
    document.getElementById('warningAlert').style.left = '-415px';
  }

  return(
    <div>
      <div id='warningAlert'>
        <h3 id='alertText' className='alertText'>_</h3>
        <div className='close' onClick={ closeAlert }>&times;</div>
      </div>
      <Router>
        <Switch>
          <Route path='/login/' component={ Home } exact />
          <Route path='/login/user' component={ User } exact />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
