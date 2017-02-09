import * as React from "react";
import * as ReactDOM from "react-dom";
import { Map } from 'immutable';

import { createStore, applyMiddleware, Store } from 'redux'

import { post } from './util/network';
import { LoginResponse } from '../common/messages';

import { Auth, StateModel } from "./redux/model";
import { User } from './components/Users';

import reducer from "./redux/reducer";
import { createNavigateToAction, createLoginAction } from "./redux/actions"

//create the redux store, using our websocket middleware for MGM async
let store = createStore<StateModel>(reducer);


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
let token: string = '';
if (localStorage.getItem("user")) {
    user = new User(JSON.parse(localStorage.getItem("user")));
    token = localStorage.getItem("token")
}
store.subscribe(() => {
    let auth = store.getState().auth;
    if (auth.user !== user) {
        if (auth.user) {
            localStorage.setItem("user", JSON.stringify(auth.user));
            localStorage.setItem("token", auth.token);
        } else {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            user = null;
            token = '';
        }
    }
})

import { Synchroniser } from './util/sync';
let syncer = new Synchroniser(store);

import { Authenticated } from "./components/Authenticated";
import { Unauthenticated } from "./components/Unauthenticated";

class App extends React.Component<{}, {}> {
    private sub: Redux.Unsubscribe;
    state: {
        st: StateModel
        loading: Boolean
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
        if (user && token) {
            this.state = {
                st: store.getState(),
                loading: true
            }
            this.resumeSession();
        } else {
            this.state = {
                st: store.getState(),
                loading: false
            }
        }
    }

    resumeSession() {
        post('/api/auth', { token: token }).then((res: LoginResponse) => {
            console.log("session resume successfull");
            let u = new User()
                .set('uuid', res.uuid)
                .set('name', res.username)
                .set('godLevel', res.accessLevel)
                .set('email', res.email)
            store.dispatch(createLoginAction(u, res.token));
            if (url == "" || url == "/")
                store.dispatch(createNavigateToAction('/account'));
            this.setState({
                loading: false
            })
        }).catch((err: Error) => {
            console.log('session resume failed')
            this.setState({
                loading: false
            })
        });
    }

    render() {
        if (this.state.loading) {
            return <h1>Loading</h1>
        }

        if (this.state.st.auth.loggedIn) {
            // show authenticated tree
            return <Authenticated state={this.state.st} dispatch={store.dispatch} synchronizer={syncer} />
        } else {
            // show splash, login, registration tree
            return <Unauthenticated route={this.state.st.url} dispatch={store.dispatch} errorMsg={this.state.st.auth.errorMsg} />
        }
    }
}

ReactDOM.render(<App />, document.getElementById("app"));