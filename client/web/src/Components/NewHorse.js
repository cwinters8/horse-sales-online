import React from 'react';
import {Form, Input, Label} from 'reactstrap';

const NewHorse = () => {
  return (
    <Form className="horse-form">
      <Label className="horse-form-label" for="name">Horse's Name</Label>
      <Input id="name" type="text" />

      <Label className="horse-form-label" for="breed">Breed</Label>
      <Input id="breed" type="text" />
    </Form>
  )
}

export default NewHorse;