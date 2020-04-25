import React from 'react';
import {Form, Input, Label} from 'reactstrap';

const NewHorse = props => {
  return (
    <Form>
      <Label for="name">Horse's Name</Label>
      <Input id="name" type="text" />
    </Form>
  )
}

export default NewHorse;