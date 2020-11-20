import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "screens/Home/Home";

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Router;
