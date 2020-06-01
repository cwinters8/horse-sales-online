import React from 'react';

import comingSoon from '../images/comingSoon.png';

const Main = () => {
  return (
    <div>
      <h2><a href="/new-horse">List a new horse</a></h2>
      <h2><a href="/horses">Find horses</a></h2>
      <img id="coming-soon-img" src={comingSoon} alt="Person leading a horse with 'Coming Soon' on its side" />
    </div>
  )
}

export default Main;