import * as React from "react";
import { Map } from 'immutable';
import { Action } from 'redux';

import { User } from '../Users';
import { Group, Role } from '../Groups';

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button, Grid, Row, Alert } from 'react-bootstrap';
import { BusyButton } from '../BusyButton';
import { ClientStack } from '../..';
import { ReduxStore } from '../../Redux';

interface props {
  show: boolean
  cancel: () => void
  user: User
  store: ReduxStore
  groups: Map<string, Group>
  members: Map<string, Map<string, string>>
  roles: Map<string, Map<string, Role>>
}

interface state {
  error?: string
  name?: string
  memberGroups?: Group[]
  candidateGroups?: Group[]
  candidateRoles?: Role[]
  selectedGroup?: Group
  selectedRole?: Role
}

export class ManageGroupsModal extends React.Component<props, state> {

  constructor(props: props) {
    super(props);
    this.state = {
      name: '',
      error: '',
      selectedGroup: null,
      selectedRole: null,
      candidateRoles: [],
      candidateGroups: [],
      memberGroups: []
    }
  }

  componentWillReceiveProps(nextProps: props) {
    if (!nextProps.user || !nextProps.show) {
      // wipe state
      this.setState({
        name: '',
        error: '',
        selectedGroup: null,
        selectedRole: null,
        candidateRoles: [],
        candidateGroups: [],
        memberGroups: []
      })
      return;
    }

    // for an unknown reason, this early exist prevents repopulation
    // if you open the same user twice in a row
    //if (this.props.groups == nextProps.groups &&
    //  this.props.members == nextProps.members &&
    //  this.props.roles == nextProps.roles &&
    //  this.props.user == nextProps.user)
    //  return;

    // Collect the groups that this user is and is not a member of
    let memberGroups: Group[] = [];
    let candidateGroups: Group[] = [];
    nextProps.groups.toArray()
      .map((g: Group) => {
        let members = nextProps.members.get(g.GroupID, Map<string, string>());
        // if this user is a member of this group, it has a role
        let roleId = members.get(nextProps.user.UUID, '');
        if (roleId === '') {
          candidateGroups.push(g);
        } else {
          let r = nextProps.roles.get(g.GroupID).get(roleId);
          memberGroups.push(g);
        }
      })

    this.setState({
      name: nextProps.user.name(),
      memberGroups: memberGroups,
      candidateGroups: candidateGroups
    })
  }

  onSelectGroup(e: { target: { value: string } }) {
    let groupID = e.target.value;
    let roles = this.props.roles.get(groupID).toArray();
    this.setState({
      selectedGroup: this.props.groups.get(groupID),
      candidateRoles: roles
    })
  }
  onSelectRole(e: { target: { value: string } }) {
    this.setState({
      selectedRole: this.props.roles.get(this.state.selectedGroup.GroupID).get(e.target.value, null)
    })
  }

  onInsertMembership() {
    return ClientStack.Group.AddUser(this.state.selectedGroup, this.props.user, this.state.selectedRole).then(() => {
      this.props.store.Group.AddUser(this.state.selectedGroup, this.state.selectedRole, this.props.user);
    }).catch((err: Error) => {
      this.setState({
        error: 'Error assigning membership: ' + err.message
      })
    });
  }

  onEjectMembership(g: Group){
    return ClientStack.Group.RemoveUser(g, this.props.user).then(() => {
      this.props.store.Group.DeleteUser(g, this.props.user);
    }).catch((err: Error) => {
      this.setState({
        error: 'Error ejecting membership: ' + err.message
      })
    });
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.cancel} >
        <Modal.Header>
          <Modal.Title>User Groups: {this.state.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{this.state.name} is a member of these groups:</p>

          <div style={{ height: "10em", overflowY: "auto", border: "1px solid grey" }}>
            {this.state.memberGroups.map((g: Group) => {
              return <p key={g.GroupID}>{g.Name} <BusyButton bsStyle="danger" bsSize="xs" onClick={this.onEjectMembership.bind(this,g)}>Eject from group</BusyButton></p>
            })}
          </div>

          <FormGroup>
            <ControlLabel>Force user into Group</ControlLabel>
            <FormControl componentClass="select" placeholder="select" onChange={this.onSelectGroup.bind(this)}>
              <option key={-1} value="">select one</option>
              {this.state.candidateGroups.map((g: Group) => {
                return (
                  <option
                    key={g.GroupID}
                    value={g.GroupID.toString()}>
                    {g.Name}
                  </option>
                )
              })}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>With Role</ControlLabel>
            <FormControl componentClass="select" placeholder="select" onChange={this.onSelectRole.bind(this)}>
              <option key={-1} value="">select one</option>
              {this.state.candidateRoles.map((r: Role) => {
                return (
                  <option
                    key={r.RoleID}
                    value={r.RoleID}>
                    {r.Name}
                  </option>
                )
              })}
            </FormControl>
          </FormGroup>
          <BusyButton onClick={this.onInsertMembership.bind(this)}>Insert Membership</BusyButton>
          {this.state.error ? <Alert bsStyle="danger">{this.state.error}</Alert> : <div />}
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.props.cancel}>Close</Button>
        </Modal.Footer>
      </Modal >
    )
  }
}