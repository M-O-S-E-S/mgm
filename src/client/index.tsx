import * as React from "react";
import * as ReactDOM from "react-dom";
import { Map } from 'immutable';

import { createStore, applyMiddleware, Store } from 'redux'

import { Auth, StateModel } from "./redux/model";
import { User } from './components/Users';

import reducer from "./redux/reducer";
import { createNavigateToAction, createLoginAction } from "./redux/actions"

//create the redux store, using our websocket middleware for MGM async
import { MGM } from "./mgmMiddleware";
let store = createStore<StateModel>(reducer, applyMiddleware(MGM));


// Update url to match internal state
let url = window.location.pathname;
store.subscribe(() => {
    if (store.getState().url !== url) {
        url = store.getState().url;
        window.history.pushState(null, null, url)
    }
})
store.dispatch(createNavigateToAction(window.location.pathname));
//watch for url changes that arent frome state, such as user back button
window.addEventListener('popstate', () => {
    if (url !== window.location.pathname) {
        url = window.location.pathname;
        store.dispatch(createNavigateToAction(window.location.pathname));
    }
})


// set up for local storage of authentication components
let user: User = null;
if (localStorage.getItem("user")) {
    user = new User(JSON.parse(localStorage.getItem("user")));
    let token = localStorage.getItem("token")
    store.dispatch(createLoginAction(user));
}
store.subscribe(() => {
    let auth = store.getState().auth;
    if (auth.user !== user) {
        if (auth.user) {
            user = auth.user;
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", auth.token);
        } else {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            user = null;
        }
    }
})

import { Authenticated } from "./components/Authenticated";
import { Unauthenticated } from "./components/Unauthenticated";

class App extends React.Component<{}, {}> {
    private sub: Redux.Unsubscribe;
    state: {
        st: StateModel
    };

    constructor(props: any) {
        super(props);
        this.sub = store.subscribe(() => {
            if (this.state.st !== store.getState()) {
                this.setState({
                    st: store.getState()
                });
            }
        });
        this.state = {
            st: store.getState()
        }
    }

    render() {
        if (this.state.st.auth.loggedIn) {
            // show authenticated tree
            return <Authenticated state={this.state.st} dispatch={ store.dispatch } />
        } else {
            // show splash, login, registration tree
            return <Unauthenticated route={this.state.st.url} dispatch={ store.dispatch } errorMsg={this.state.st.auth.errorMsg}/>
        }
    }
}

ReactDOM.render(<App />, document.getElementById("app"));