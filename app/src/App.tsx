import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import Home from "./routes/Home";
import Dashboard from "./routes/Dashboard";
import Reviews from "./routes/Reviews";
import Header from "./Header";

const App = () => {
  const loggedIn = localStorage.getItem('accountId');

  return (
    <div>
      <Router>  
        <Header />
        <Switch>
          <Route path="/reviews" component={Reviews} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/login" component={Home} />
          <Route exact path="/" render={(props) => (
              loggedIn ? <Redirect to="/dashboard" /> : <Home {...props} />
            )}
          />
        </Switch>
      </Router>
    </div>
  );
};

export default App;
