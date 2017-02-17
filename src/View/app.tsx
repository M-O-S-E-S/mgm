import * as React from "react";
import * as ReactDOM from "react-dom";
import { Unsubscribe } from 'redux';
import { Map } from 'immutable';

import { ClientStack, LoginResponse } from './ClientStack';

import { ReduxStore, getStore, StateModel } from "./Redux";
import { User } from './Immutable';

//create the redux store, using our websocket middleware for MGM async
let store = getStore();


// Update url to match internal state
let url = window.location.pathname;
store.Subscribe(() => {
    if (store.GetState().url !== url) {
        url = store.GetState().url;
        window.history.pushState(null, null, url)
    }
})
store.NavigateTo(window.location.pathname);
//watch for url changes that arent frome state, such as user back button
window.addEventListener('popstate', () => {
    if (url !== window.location.pathname) {
        url = window.location.pathname;
        store.NavigateTo(window.location.pathname);
    }
})


// set up for local storage of authentication components
let user: string = '';
let token: string = '';
let isAdmin: boolean = false;
if (localStorage.getItem("user")) {
    user = localStorage.getItem("user");
    token = localStorage.getItem("token");
    isAdmin = localStorage.getItem("isAdmin") === 'true';
    ClientStack.updateToken(token);
    ;
}
store.Subscribe(() => {
    let auth = store.GetState().auth;
    if (auth.user !== user || auth.token !== token) {
        if (auth.user) {
            localStorage.setItem("user", auth.user);
            localStorage.setItem("token", auth.token);
            localStorage.setItem("isAdmin", auth.isAdmin ? 'true' : 'false');
            ClientStack.updateToken(token);
        } else {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("isAdmin");
            user = null;
            token = '';
            ClientStack.updateToken(null);
        }
    }
})

import { Authenticated } from "./Components/Authenticated";
import { Unauthenticated } from "./Components/Unauthenticated";

class App extends React.Component<{}, {}> {
    state: {
        st: StateModel
        loading: Boolean
    };

    constructor(props: any) {
        super(props);
        store.Subscribe(() => {
            if (this.state.st !== store.GetState()) {
                this.setState({
                    st: store.GetState()
                });
            }
        });
        if (user && token) {
            this.state = {
                st: store.GetState(),
                loading: true
            }
            this.resumeSession();
        } else {
            console.log('We dont have both a user and a token, skipping resume')
            this.state = {
                st: store.GetState(),
                loading: false
            }
        }
    }

    resumeSession() {
        ClientStack.resumeSession().then((res: LoginResponse) => {
            console.log("session resume successfull");
            store.Auth.Login(res.uuid, res.isAdmin, res.token);
            if (url == "" || url == "/")
                store.NavigateTo('/account');
            this.setState({
                loading: false
            })
        }).catch((err: Error) => {
            console.log('session resume failed: ' + err.message)
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
            return <Authenticated state={this.state.st} store={store} />
        } else {
            // show splash, login, registration tree
            return <Unauthenticated route={this.state.st.url} store={store} errorMsg={this.state.st.auth.errorMsg} />
        }
    }
}

ReactDOM.render(<App />, document.getElementById("app"));