import * as React from "react";

import { Region } from '.';

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import { BusyButton } from '../../util/BusyButton';
import { post, upload } from '../../util/network';

interface props {
  show: boolean,
  region: Region,
  dismiss: () => void
}


export class ContentModal extends React.Component<props, {}> {

  // a property to hang file uploads from
  oarFile: any = null;


  onUploadOar(): Promise<void> {
    let file = this.oarFile.files[0];
    if (file == undefined) {
      // no selection was made
      console.log('file object is empty...');
      return;
    }

    // Create an oar upload job for this user and region
    return post('/api/task/loadOar/' + this.props.region.uuid)
      .then((res: any) => {
        let jobID = res.ID;
        // todo: insert job into redux to make it appear before the next data refresh

        // initiate the upload
        return upload('/api/task/upload/'+ jobID, file);
      }).catch((err: Error) => {
        console.log(err.message);
      });
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.dismiss} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>Managing Region {this.props.region ? this.props.region.name : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Load an OAR file</h3>
          <p>input type file, and upload</p>
          <input type="file" name="oarFile" ref={(ref) => this.oarFile = ref} />
          <BusyButton onClick={this.onUploadOar.bind(this)}>Upload</BusyButton>

          <h3>Download an OAR file</h3>
          <p>trigger with warnong about asynchrounous nature</p>

          <h3>Reset region to default</h3>
          <p>trigger with warning about never going back</p>

        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.dismiss}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}