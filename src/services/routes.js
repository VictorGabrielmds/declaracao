import React from "react";
import { Route, Switch, HashRouter } from "react-router-dom";

import Home from "../pages/home";
import Input from "../pages/input"

const AppRoutes = () => {
   return(
       <HashRouter>
           <Switch>
               <Route exact path="/" component={Home} />
               <Route path="/input" component={Input} />
           </Switch>
       </HashRouter>
   )
}

export default AppRoutes;