import * as React from "react";

import { Button, ButtonProps } from 'react-bootstrap';

interface props extends ButtonProps {
  onClick: () => Promise<void>
}

interface state {
  busy: boolean
}

export class BusyButton extends React.Component<props, {}> {
  state: state

  constructor(p: props) {
    super(p);
    this.state = {
      busy: false
    }
  }

  handleClick() {
    if(this.state.busy){
      return;
    }
    this.setState({
      busy: true
    });
    this.props.onClick().then(() => {
      this.setState({
        busy: false
      })
    });
  }

  render() {
    // spread and remove our props before passing to Button
    const {buttonLabel, callback, ...rest} = this.props;
    return (
      <Button {...rest} onClick={this.handleClick.bind(this)}>
        {this.state.busy ? (<i className="fa fa-spinner fa-spin" aria-hidden="true"></i>) : this.props.children}
      </Button>
    )
  }
}