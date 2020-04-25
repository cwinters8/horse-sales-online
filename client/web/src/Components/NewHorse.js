import React from 'react';
import {Form, Input, Label} from 'reactstrap';

const NewHorse = props => {
  // if the user is signed out, redirect to login
  // props.firebase.auth().onAuthStateChanged(user => {
  //   if (!user) {
  //     window.localStorage.setItem('redirectAfterLogin', '/new-horse');
  //     window.location.href = '/login';
  //   }
  // });
  return (
    <Form>
      <Label for="name">Horse's Name</Label>
      <Input id="name" type="text" />
    </Form>
  )
}

export default NewHorse;