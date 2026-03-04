import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import './index.css';
import "./App.css";

import Home from "./pages/home";
import Input from "./pages/input";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/input" component={Input} />
      </Switch>
    </Router>
  </React.StrictMode>
);