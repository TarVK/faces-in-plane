import ReactDOM from "react-dom";
import React from "react";
import {App} from "./App";
import {initializeIcons} from "office-ui-fabric-react";

initializeIcons();
ReactDOM.render(<App />, document.getElementById("root"));
