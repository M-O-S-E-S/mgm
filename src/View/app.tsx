import * as React from "react";
import * as ReactDOM from "react-dom";
import { Unsubscribe } from 'redux';
import { Map } from 'immutable';

import { ClientStack } from './ClientStack';

import { ReduxStore, getStore, StateModel, ResumeSession } from "./Redux";
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
}
store.Subscribe(() => {
    let auth = store.GetState().auth;
    if (auth.user !== user) {
        user = auth.user;
        if (user) {
            localStorage.setItem("user", auth.user);
            localStorage.setItem("isAdmin", auth.isAdmin ? 'true' : 'false');
        } else {
            localStorage.removeItem("user");
            localStorage.removeItem("isAdmin");
            user = null;
        }
    }
    if (auth.token !== token) {
        token = auth.token;
        if (auth.token) {
            localStorage.setItem("token", token);
            ClientStack.updateToken(token);
        } else {
            localStorage.removeItem("token");
            token = '';
            ClientStack.updateToken('');
        }
    }
});

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
        ResumeSession(store).then(() => {
            if (url == "" || url == "/")
                store.NavigateTo('/account');
            this.setState({
                loading: false
            });
        }).catch((err: Error) => {
            this.setState({
                loading: false
            });
        })
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