import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Home from "./routes/Home";
import Dashboard from "./routes/Dashboard";

const App = () => {
  const loggedIn = localStorage.getItem('accountId');
  return (
    <Router>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route exact path="/" render={(props) => (
            loggedIn ? <Redirect to="/dashboard" /> : <Home {...props} />
          )}
        />
      </Switch>
    </Router>
  );
};

export default App;
