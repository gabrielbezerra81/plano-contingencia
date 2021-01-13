import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "screens/Home/Home";
import LoginRedirect from "./LoginRedirect";

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/logged">
          <LoginRedirect />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Router;
