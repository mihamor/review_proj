import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Home from "./routes/Home";

const App = () => {
  const loggedIn = localStorage.getItem('accountId');
  return (
    <Router>
      <Switch>
        <Route path="/dashboard" component={Home} />
        <Route exact path="/" render={(props) => (
            loggedIn ? <Redirect to="/dashboard" /> : <Home {...props} />
          )}
        />
      </Switch>
    </Router>
  );
};

export default App;
