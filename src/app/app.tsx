import * as React from "react";
import { render } from "react-dom";
import { Page, Row, Column } from "hedron";
import { BrowserRouter, Route, Link, Switch } from "react-router-dom";
import { injectGlobal } from "styled-components";

injectGlobal`
  body {
    font-family: 'Open Sans', sans-serif;
  }
`;

import New from "./New";
import Session from "./Session";

render(
  <Page>
    <Row>
      <Column>
        <h1>Poker</h1>
      </Column>
    </Row>
    <BrowserRouter>
      <Switch>
        <Route
          exact={true}
          path="/"
          render={() => <Link to="/new">Create session</Link>}
        />
        <Route path="/new" component={New} />
        <Route path="/session/:sessionId" component={Session} />
      </Switch>
    </BrowserRouter>
  </Page>,
  document.getElementById("root")
);
